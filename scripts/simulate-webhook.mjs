import crypto from 'crypto';

const endpoint = process.env.WEBHOOK_URL ?? 'http://localhost:3000/api/paddle/webhook';
const secret = process.env.PADDLE_WEBHOOK_SECRET ?? 'dev_secret';
const orderId = process.env.ORDER_ID ?? '00000000-0000-0000-0000-000000000000';
const eventType = process.env.EVENT_TYPE ?? 'payment_succeeded';
const transactionId = process.env.PADDLE_TRANSACTION_ID ?? 'txn_simulated_123';

const body = JSON.stringify({
  event_type: eventType,
  data: {
    id: transactionId,
    custom_data: {
      order_id: orderId
    }
  }
});

const timestamp = Math.floor(Date.now() / 1000).toString();
const signature = crypto.createHmac('sha256', secret).update(`${timestamp}:${body}`, 'utf8').digest('hex');
const signatureHeader = `ts=${timestamp};h1=${signature}`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Paddle-Signature': signatureHeader
  },
  body
});

const responseBody = await response.text();

console.log(`Webhook response (${response.status}):`, responseBody);
