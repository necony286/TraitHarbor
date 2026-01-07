import { describe, expect, it } from 'vitest';
import { OrderStatus } from '../lib/orders';
import { extractOrderIds, parsePaddleWebhook, shouldUpdateOrder } from '../lib/paddle-webhook';
import { createPaddleSignatureHeader, verifyPaddleSignature } from '../lib/signature';

describe('paddle webhook helpers', () => {
  it('parses order identifiers from payload data', () => {
    const { orderId, paddleOrderId } = extractOrderIds({
      id: 'txn_123',
      custom_data: { order_id: 'order_abc' }
    });

    expect(orderId).toBe('order_abc');
    expect(paddleOrderId).toBe('txn_123');
  });

  it('parses a payment success event', () => {
    const payload = {
      event_type: 'payment_succeeded',
      data: {
        id: 'txn_456',
        custom_data: { order_id: 'order_def' }
      }
    };

    const event = parsePaddleWebhook(payload);
    expect(event).not.toBeNull();
    expect(event?.status).toBe('paid');
    expect(event?.orderId).toBe('order_def');
    expect(event?.paddleOrderId).toBe('txn_456');
  });

  it('ignores unknown event types', () => {
    const payload = {
      event_type: 'unknown_event',
      data: { id: 'txn_789' }
    };

    const event = parsePaddleWebhook(payload);
    expect(event?.status).toBeUndefined();
  });
});

describe('paddle webhook idempotency', () => {
  const statusMatrix: Array<[OrderStatus, OrderStatus, boolean]> = [
    ['created', 'paid', true],
    ['pending_webhook', 'paid', true],
    ['paid', 'paid', false],
    ['paid', 'failed', false],
    ['failed', 'paid', true]
  ];

  statusMatrix.forEach(([currentStatus, nextStatus, expected]) => {
    it(`returns ${expected} for ${currentStatus} -> ${nextStatus}`, () => {
      expect(shouldUpdateOrder(currentStatus, nextStatus)).toBe(expected);
    });
  });
});

describe('paddle webhook signatures', () => {
  it('verifies a valid signature', () => {
    const body = JSON.stringify({ event_type: 'payment_succeeded', data: { id: 'txn' } });
    const secret = 'secret';
    const header = createPaddleSignatureHeader(body, secret, 1234567890);

    expect(verifyPaddleSignature(body, header, secret)).toBe(true);
  });

  it('rejects an invalid signature', () => {
    const body = JSON.stringify({ event_type: 'payment_succeeded', data: { id: 'txn' } });
    const secret = 'secret';
    const header = createPaddleSignatureHeader(body, 'wrong', 1234567890);

    expect(verifyPaddleSignature(body, header, secret)).toBe(false);
  });
});
