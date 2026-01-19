import { NextResponse } from 'next/server';
import {
  getOrderById,
  getScoresByResultId,
  storeReportAsset,
  updateOrderFromWebhook,
  updateOrderReportAccessToken,
  updateOrderReportFileKey
} from '../../../../../lib/db';
import { sendReportEmail } from '../../../../../lib/email';
import { logError, logInfo, logWarn } from '../../../../../lib/logger';
import { parsePaddleWebhook, shouldUpdateOrder } from '../../../../../lib/paddle-webhook';
import { verifyPaddleSignature } from '../../../../../lib/signature';
import { orderStatusSchema } from '../../../../../lib/orders';
import { enforceRateLimit, getClientIdentifier } from '../../../../../lib/rate-limit';
import { generateReportAccessToken, hashReportAccessToken } from '../../../../../lib/report-access';
import { PdfRenderConcurrencyError, generateReportPdf } from '../../../../../lib/pdf';
import { getReportPath, uploadReport } from '../../../../../lib/storage';
import { absoluteUrl } from '@/lib/siteUrl';

export const runtime = 'nodejs';

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
    requestPdfGeneration(order.id);

    const customerEmail = updatedOrder?.email ?? parsedEvent.customerEmail;
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

    const reportUrl = absoluteUrl('/retrieve-report');

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      logInfo('Skipping report PDF email because Resend is not configured.', { orderId: order.id });
    } else if (!updatedOrder) {
      logWarn('Paid order missing updated order data for report delivery.', { orderId: order.id });
    } else if (!updatedOrder.response_id) {
      logWarn('Paid order missing response id for report generation.', { orderId: order.id });
    } else {
      try {
        const { data: traits, error: scoresError } = await getScoresByResultId(updatedOrder.response_id);
        if (scoresError) {
          throw new Error(scoresError.message);
        }
        if (!traits) {
          logWarn('Paid order missing trait scores for report generation.', { orderId: order.id });
          return NextResponse.json({ received: true });
        }

        const pdf = await generateReportPdf({
          name: 'You',
          date: new Date(updatedOrder.created_at),
          traits
        });
        const pdfBase64 = Buffer.from(pdf).toString('base64');

        await uploadReport(updatedOrder.id, pdf);
        const reportPath = getReportPath(updatedOrder.id);
        const { error: reportFileError } = await updateOrderReportFileKey({
          orderId: updatedOrder.id,
          reportFileKey: reportPath
        });
        if (reportFileError) {
          throw new Error(reportFileError.message);
        }

        if (updatedOrder.user_id) {
          const { error: assetError } = await storeReportAsset({
            orderId: updatedOrder.id,
            userId: updatedOrder.user_id,
            reportPath,
            kind: 'report_pdf'
          });
          if (assetError) {
            logWarn('Failed to store report asset for paid order.', {
              orderId: updatedOrder.id,
              error: assetError.message
            });
          }
        }

        await sendReportEmail({
          orderId: updatedOrder.id,
          email: customerEmail,
          reportUrl,
          pdfBase64
        });
      } catch (error) {
        if (error instanceof PdfRenderConcurrencyError) {
          logWarn('PDF generation busy for paid order email.', { orderId: order.id });
        } else {
          logWarn('Failed to send paid report email with PDF.', { orderId: order.id, error });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
