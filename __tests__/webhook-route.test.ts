import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '../src/app/api/paddle/webhook/route';

const orderId = '6a8bdef2-5c72-4c1b-9b89-2fb3b52b70b7';
const userId = 'd3f392f9-5422-4d1a-b3f6-179b0b85a45b';

const ordersMaybeSingleMock = vi.fn();
const ordersUpdateSingleMock = vi.fn();
const usersMaybeSingleMock = vi.fn();
const usersUpdateMock = vi.fn();
const usersUpdateEqMock = vi.fn();

const supabaseMock = {
  from: vi.fn((table: string) => {
    if (table === 'orders') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: ordersMaybeSingleMock
          })
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: ordersUpdateSingleMock
            })
          })
        })
      };
    }

    if (table === 'users') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: usersMaybeSingleMock
          })
        }),
        update: usersUpdateMock.mockReturnValue({
          eq: usersUpdateEqMock
        })
      };
    }

    return {};
  })
};

vi.mock('../lib/supabase', () => ({
  getSupabaseAdminClient: () => supabaseMock
}));

vi.mock('../lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn()
}));

describe('paddle webhook route', () => {
  const env = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...env, NODE_ENV: 'development', ALLOW_WEBHOOK_TEST_BYPASS: '1' };

    ordersMaybeSingleMock.mockResolvedValue({
      data: { id: orderId, status: 'pending_webhook', paddle_order_id: null, user_id: userId },
      error: null
    });

    ordersUpdateSingleMock.mockResolvedValue({ data: { id: orderId }, error: null });

    usersMaybeSingleMock.mockResolvedValue({ data: { id: userId, email: null }, error: null });

    usersUpdateEqMock.mockResolvedValue({ error: null });
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
    expect(supabaseMock.from).toHaveBeenCalledWith('orders');
    expect(supabaseMock.from).toHaveBeenCalledWith('users');
    expect(usersMaybeSingleMock).toHaveBeenCalledTimes(1);
    expect(usersUpdateMock).toHaveBeenCalledWith({ email: 'customer@example.com' });
    expect(usersUpdateEqMock).toHaveBeenCalledWith('id', userId);
  });
});
