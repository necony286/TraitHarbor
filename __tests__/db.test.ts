import { beforeEach, describe, expect, it, vi } from 'vitest';

const logWarnMock = vi.fn();

vi.mock('../lib/logger', () => ({
  logWarn: (...args: unknown[]) => logWarnMock(...args)
}));

const getSupabaseAdminClientMock = vi.fn();

vi.mock('../lib/supabase', () => ({
  getSupabaseAdminClient: () => getSupabaseAdminClientMock()
}));

import { updateOrderFromWebhook } from '../lib/db';

const ORDER_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = '22222222-2222-2222-2222-222222222222';

const baseOrder = {
  id: ORDER_ID,
  status: 'paid',
  amount_cents: 5000,
  response_id: null,
  paddle_order_id: null,
  created_at: new Date().toISOString(),
  report_access_token_hash: null,
  user_id: USER_ID
};

describe('updateOrderFromWebhook', () => {
  const ordersUpdateChain = {
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn()
  };

  const usersSelectChain = {
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn()
  };

  const usersUpdateChain = {
    eq: vi.fn()
  };

  const ordersTable = {
    update: vi.fn(() => ordersUpdateChain)
  };

  const usersTable = {
    select: vi.fn(() => usersSelectChain),
    update: vi.fn(() => usersUpdateChain)
  };

  const fromMock = vi.fn((table: string) => {
    if (table === 'orders') {
      return ordersTable;
    }
    if (table === 'users') {
      return usersTable;
    }
    throw new Error(`Unexpected table: ${table}`);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    ordersUpdateChain.single.mockResolvedValue({ data: baseOrder, error: null });
    usersSelectChain.maybeSingle.mockResolvedValue({ data: null, error: null });
    usersUpdateChain.eq.mockResolvedValue({ error: null });
    getSupabaseAdminClientMock.mockReturnValue({ from: fromMock });
  });

  it('logs when the user is not found for the order', async () => {
    usersSelectChain.maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await updateOrderFromWebhook({
      orderId: ORDER_ID,
      status: 'paid',
      paddleOrderId: 'paddle-123',
      customerEmail: 'missing@example.com'
    });

    expect(result.error).toBeNull();
    expect(ordersTable.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paid',
        paddle_order_id: 'paddle-123',
        paid_at: expect.any(String),
        updated_at: expect.any(String)
      })
    );
    expect(logWarnMock).toHaveBeenCalledWith('User not found for order during webhook processing.', {
      orderId: ORDER_ID,
      userId: USER_ID
    });
    expect(usersTable.update).not.toHaveBeenCalled();
  });

  it('updates the user email when missing', async () => {
    usersSelectChain.maybeSingle.mockResolvedValue({ data: { id: USER_ID, email: null }, error: null });

    const result = await updateOrderFromWebhook({
      orderId: ORDER_ID,
      status: 'paid',
      customerEmail: 'NewEmail@example.com'
    });

    expect(result.error).toBeNull();
    expect(ordersTable.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paid',
        paid_at: expect.any(String),
        updated_at: expect.any(String)
      })
    );
    expect(usersTable.update).toHaveBeenCalledWith({ email: 'newemail@example.com' });
    expect(usersUpdateChain.eq).toHaveBeenCalledWith('id', USER_ID);
    expect(logWarnMock).not.toHaveBeenCalled();
  });

  it('does not log or update when the email matches', async () => {
    usersSelectChain.maybeSingle.mockResolvedValue({ data: { id: USER_ID, email: 'match@example.com' }, error: null });

    const result = await updateOrderFromWebhook({
      orderId: ORDER_ID,
      status: 'paid',
      customerEmail: 'match@example.com'
    });

    expect(result.error).toBeNull();
    expect(ordersTable.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paid',
        paid_at: expect.any(String),
        updated_at: expect.any(String)
      })
    );
    expect(usersTable.update).not.toHaveBeenCalled();
    expect(logWarnMock).not.toHaveBeenCalled();
  });

  it('logs when the email from the webhook differs', async () => {
    usersSelectChain.maybeSingle.mockResolvedValue({ data: { id: USER_ID, email: 'stored@example.com' }, error: null });

    const result = await updateOrderFromWebhook({
      orderId: ORDER_ID,
      status: 'paid',
      customerEmail: 'Different@example.com'
    });

    expect(result.error).toBeNull();
    expect(ordersTable.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paid',
        paid_at: expect.any(String),
        updated_at: expect.any(String)
      })
    );
    expect(logWarnMock).toHaveBeenCalledWith('Webhook email mismatch for user.', {
      orderId: ORDER_ID,
      existingEmail: 'stored@example.com',
      webhookEmail: 'different@example.com'
    });
  });

  it('logs a warning when user lookup fails', async () => {
    const lookupError = { message: 'DB connection failed', code: '500' };
    usersSelectChain.maybeSingle.mockResolvedValue({ data: null, error: lookupError });

    const result = await updateOrderFromWebhook({
      orderId: ORDER_ID,
      status: 'paid',
      customerEmail: 'any@example.com'
    });
    expect(result.error).toBeNull();
    expect(ordersTable.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paid',
        paid_at: expect.any(String),
        updated_at: expect.any(String)
      })
    );
    expect(logWarnMock).toHaveBeenCalledWith('Failed to lookup user for webhook email update.', {
      orderId: ORDER_ID,
      error: lookupError
    });
    expect(usersTable.update).not.toHaveBeenCalled();
  });

  it('logs a warning when user email update fails', async () => {
    usersSelectChain.maybeSingle.mockResolvedValue({ data: { id: USER_ID, email: null }, error: null });
    const updateError = { message: 'Constraint violation', code: '23505' };
    usersUpdateChain.eq.mockResolvedValue({ error: updateError });

    const result = await updateOrderFromWebhook({
      orderId: ORDER_ID,
      status: 'paid',
      customerEmail: 'newemail@example.com'
    });
    expect(result.error).toBeNull();
    expect(ordersTable.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paid',
        paid_at: expect.any(String),
        updated_at: expect.any(String)
      })
    );
    expect(logWarnMock).toHaveBeenCalledWith('Failed to update user email from webhook.', {
      orderId: ORDER_ID,
      error: updateError
    });
  });
});
