import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '../src/app/api/paddle/webhook/route';

const orderId = '6a8bdef2-5c72-4c1b-9b89-2fb3b52b70b7';
const userId = 'd3f392f9-5422-4d1a-b3f6-179b0b85a45b';

const getOrderByIdMock = vi.fn();
const updateOrderFromWebhookMock = vi.fn();

vi.mock('../lib/db', () => ({
  getOrderById: (...args: unknown[]) => getOrderByIdMock(...args),
  updateOrderFromWebhook: (...args: unknown[]) => updateOrderFromWebhookMock(...args)
}));

vi.mock('../lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn()
}));

vi.mock('../lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
  getClientIdentifier: vi.fn().mockReturnValue('test-client')
}));

describe('paddle webhook route', () => {
  const env = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...env, NODE_ENV: 'development', ALLOW_WEBHOOK_TEST_BYPASS: '1' };

    getOrderByIdMock.mockResolvedValue({
      data: {
        id: orderId,
        status: 'pending_webhook',
        amount_cents: 5000,
        response_id: '11111111-1111-1111-1111-111111111111',
        paddle_order_id: null,
        created_at: new Date().toISOString(),
        report_access_token_hash: null,
        user_id: userId
      },
      error: null
    });

    updateOrderFromWebhookMock.mockResolvedValue({
      data: {
        id: orderId,
        status: 'paid',
        amount_cents: 5000,
        response_id: '11111111-1111-1111-1111-111111111111',
        paddle_order_id: 'txn_123',
        created_at: new Date().toISOString(),
        report_access_token_hash: null,
        user_id: userId
      },
      error: null
    });
  });

  afterEach(() => {
    process.env = env;
  });

  it('updates the user email when a paid webhook includes customer email', async () => {
    const payload = {
      event_type: 'payment_succeeded',
      data: {
        id: 'txn_123',
        custom_data: { order_id: orderId },
        customer_email: 'Customer@example.com'
      }
    };

    const response = await POST(
      new Request('http://localhost/api/paddle/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    );

    expect(response.status).toBe(200);
    expect(getOrderByIdMock).toHaveBeenCalledWith({ orderId, paddleOrderId: 'txn_123' });
    expect(updateOrderFromWebhookMock).toHaveBeenCalledWith({
      orderId,
      status: 'paid',
      paddleOrderId: 'txn_123',
      customerEmail: 'Customer@example.com'
    });
  });

  it('does not allow webhook bypass in production', async () => {
    process.env = {
      ...env,
      NODE_ENV: 'production',
      ALLOW_WEBHOOK_TEST_BYPASS: '1',
      PADDLE_WEBHOOK_SECRET: 'secret'
    };

    const payload = {
      event_type: 'payment_succeeded',
      data: {
        id: 'txn_123',
        custom_data: { order_id: orderId }
      }
    };

    const response = await POST(
      new Request('http://localhost/api/paddle/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    );

    expect(response.status).toBe(400);
    expect(getOrderByIdMock).not.toHaveBeenCalled();
    expect(updateOrderFromWebhookMock).not.toHaveBeenCalled();
  });
});
