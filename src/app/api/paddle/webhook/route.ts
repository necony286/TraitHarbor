import { NextResponse } from 'next/server';
import { getOrderById, updateOrderFromWebhook, updateOrderReportAccessToken } from '../../../../../lib/db';
import { sendReportEmail } from '../../../../../lib/email';
import { logError, logInfo, logWarn } from '../../../../../lib/logger';
import { parsePaddleWebhook, shouldUpdateOrder } from '../../../../../lib/paddle-webhook';
import { verifyPaddleSignature } from '../../../../../lib/signature';
import { orderStatusSchema } from '../../../../../lib/orders';
import { enforceRateLimit, getClientIdentifier } from '../../../../../lib/rate-limit';
import { generateReportAccessToken, hashReportAccessToken } from '../../../../../lib/report-access';
import { BrowserlessConfigError, getOrCreateReportDownloadUrl } from '../../../../../lib/report-download';
import { absoluteUrl } from '@/lib/siteUrl';

export const runtime = 'nodejs';

const REPORT_ATTACHMENT_TTL_SECONDS = 60 * 60;

const getWebhookSecret = () => {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Missing PADDLE_WEBHOOK_SECRET');
  }
  return secret;
};

const shouldBypassSignature = () => {
  if (process.env.NODE_ENV !== 'development') {
    if (process.env.ALLOW_WEBHOOK_TEST_BYPASS === '1') {
      logWarn('Webhook signature bypass ignored outside development.');
    }
    return false;
  }

  return process.env.ALLOW_WEBHOOK_TEST_BYPASS === '1';
};

const requestPdfGeneration = (orderId: string) => {
  logInfo('PDF generation queued for paid order.', { orderId });
};

export async function POST(request: Request) {
  const body = await request.text();

  if (!shouldBypassSignature()) {
    let secret: string;
    try {
      secret = getWebhookSecret();
    } catch (error) {
      logError('Webhook secret missing.', { message: error instanceof Error ? error.message : 'unknown' });
      return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
    }

    const signature = request.headers.get('Paddle-Signature');
    if (!verifyPaddleSignature(body, signature, secret)) {
      logWarn('Invalid Paddle webhook signature.', { hasSignature: Boolean(signature) });
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
    }
  } else {
    logWarn('Webhook signature bypass enabled for development.');
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parsedEvent = parsePaddleWebhook(payload);
  if (!parsedEvent) {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  const webhookIdentifier = `${getClientIdentifier(request)}:${parsedEvent.eventId ?? parsedEvent.paddleTransactionId ?? 'unknown'}`;
  const rateLimitResponse = await enforceRateLimit({
    request,
    route: 'paddle-webhook',
    limit: 30,
    window: '1 m',
    mode: 'fail-closed',
    identifier: webhookIdentifier
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (!parsedEvent.status) {
    logInfo('Webhook event ignored.', { eventType: parsedEvent.eventType });
    return NextResponse.json({ received: true, ignored: true });
  }

  if (!parsedEvent.orderId && !parsedEvent.paddleOrderId) {
    logWarn('Webhook missing order identifiers.', { eventType: parsedEvent.eventType });
    return NextResponse.json({ error: 'Order identifiers missing.' }, { status: 400 });
  }

  let order;
  try {
    const { data, error: lookupError } = await getOrderById({
      orderId: parsedEvent.orderId,
      paddleOrderId: parsedEvent.paddleOrderId
    });

    if (lookupError) {
      logError('Failed to lookup order for webhook.', { error: lookupError.message });
      return NextResponse.json({ error: 'Unable to reconcile order.' }, { status: 500 });
    }

    if (!data) {
      logWarn('Order not found for webhook.', {
        orderId: parsedEvent.orderId,
        paddleOrderId: parsedEvent.paddleOrderId
      });
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    order = data;
  } catch (error) {
    logError('Failed to initialize Supabase admin client for webhook.', {
      message: error instanceof Error ? error.message : 'unknown'
    });
    return NextResponse.json({ error: 'Unable to process webhook.' }, { status: 500 });
  }

  const parsedStatus = orderStatusSchema.safeParse(order.status);
  if (!parsedStatus.success) {
    logError('Order has invalid status.', {
      orderId: order.id,
      status: order.status
    });
    return NextResponse.json({ error: 'Invalid order status.' }, { status: 500 });
  }

  if (!shouldUpdateOrder(parsedStatus.data, parsedEvent.status)) {
    logInfo('Webhook received for already processed order.', {
      orderId: order.id,
      status: parsedStatus.data,
      eventType: parsedEvent.eventType
    });
    return NextResponse.json({ received: true, ignored: true });
  }

  const { data: updatedOrder, error: updateError } = await updateOrderFromWebhook({
    orderId: order.id,
    status: parsedEvent.status,
    paddleOrderId: parsedEvent.paddleOrderId,
    paddleTransactionId: parsedEvent.paddleTransactionId,
    customerEmail: parsedEvent.customerEmail
  });

  if (updateError) {
    logError('Failed to update order from webhook.', {
      error: updateError.message,
      orderId: order.id
    });
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
  }

  if (parsedEvent.status === 'paid') {
    if (!updatedOrder) {
      logWarn('Paid order missing updated order data for report delivery.', { orderId: order.id });
      return NextResponse.json({ received: true });
    }

    requestPdfGeneration(order.id);

    const customerEmail = updatedOrder.email ?? parsedEvent.customerEmail;
    if (!customerEmail) {
      logWarn('Paid order missing customer email for report delivery.', { orderId: order.id });
      return NextResponse.json({ received: true });
    }

    let reportToken = '';
    let reportTokenHash = '';
    try {
      reportToken = generateReportAccessToken();
      reportTokenHash = hashReportAccessToken(reportToken);
    } catch (error) {
      logError('Failed to generate report access token for paid order.', { orderId: order.id, error });
      return NextResponse.json({ received: true });
    }

    try {
      const { error } = await updateOrderReportAccessToken({
        orderId: order.id,
        reportAccessTokenHash: reportTokenHash
      });
      if (error) {
        logWarn('Failed to persist report access token for paid order.', { orderId: order.id, error });
        return NextResponse.json({ received: true });
      }
    } catch (error) {
      logError('Failed to update report access token for paid order.', { orderId: order.id, error });
      return NextResponse.json({ received: true });
    }

    const reportUrl = absoluteUrl(`/r/${updatedOrder.id}?token=${encodeURIComponent(reportToken)}`);
    const shouldSkipDelivery =
      process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT === '1';

    if (shouldSkipDelivery) {
      logInfo('Skipping paid report delivery in test mode.', { orderId: order.id });
      return NextResponse.json({ received: true });
    }

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      logInfo('Skipping report PDF email because Resend is not configured.', { orderId: order.id });
    } else if (!updatedOrder.response_id) {
      logWarn('Paid order missing response id for report generation.', { orderId: order.id });
    } else {
      let attachmentUrl: string | undefined;
      let attachmentFilename: string | undefined;

      try {
        const { url } = await getOrCreateReportDownloadUrl({
          order: updatedOrder,
          ttlSeconds: REPORT_ATTACHMENT_TTL_SECONDS
        });

        attachmentUrl = url;
        attachmentFilename = `TraitHarbor-Report-${updatedOrder.id.slice(0, 8)}.pdf`;
      } catch (error) {
        if (error instanceof BrowserlessConfigError) {
          logWarn('Browserless configuration error for report email attachment.', {
            orderId: order.id,
            message: error.message
          });
        } else if (error instanceof Error && error.name === 'TimeoutError') {
          logWarn('PDF generation timed out for report email attachment.', {
            orderId: order.id,
            message: error.message
          });
        } else {
          logWarn('Failed to generate signed PDF URL for paid order email.', {
            orderId: order.id,
            error
          });
        }
      }

      try {
        await sendReportEmail({
          orderId: updatedOrder.id,
          email: customerEmail,
          reportUrl,
          attachmentUrl,
          attachmentFilename
        });
      } catch (emailError) {
        logError('Failed to deliver report email.', {
          orderId: order.id,
          error: emailError,
          withAttachment: Boolean(attachmentUrl)
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
