import { updateProfile } from './profile';
import { supabase } from '../../../lib/supabase';

jest.mock('../../lib/supabase', () => {
  const single = jest.fn();
  return {
    supabase: {
      __single: single,
      auth: {
        getUser: jest.fn(),
        updateUser: jest.fn(),
      },
      from: jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({ single })),
          })),
        })),
      })),
    },
  };
});

const mockGetUser = supabase.auth.getUser as jest.Mock;
const mockUpdateUser = supabase.auth.updateUser as jest.Mock;
const mockSingle = (supabase as unknown as { __single: jest.Mock }).__single;

const fakeUser = { id: 'user-1', email: 'test@example.com' };

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: fakeUser } });
  mockSingle.mockResolvedValue({ data: { id: 'user-1' }, error: null });
  mockUpdateUser.mockResolvedValue({ error: null });
});

describe('updateProfile', () => {
  it('returns success when both DB and metadata update succeed', async () => {
    const result = await updateProfile('Ahmad', 'Muhammad');
    expect(result.status).toBe('success');
  });

  it('calls supabase.from users with correct fields', async () => {
    await updateProfile('Ahmad', 'Muhammad');
    expect(supabase.from).toHaveBeenCalledWith('users');
  });

  it('calls auth.updateUser with trimmed first and last name', async () => {
    await updateProfile('  Ahmad  ', '  Muhammad  ');
    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { first_name: 'Ahmad', last_name: 'Muhammad' },
    });
  });

  it('returns errorResponse when there is no active session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await updateProfile('Ahmad', 'Muhammad');
    expect(result.status).toBe('error');
    expect(result.code).toBe(401);
  });

  it('returns errorResponse when the DB update fails', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    const result = await updateProfile('Ahmad', 'Muhammad');
    expect(result.status).toBe('error');
    expect(result.message).toBe('DB error');
  });

  it('does not call auth.updateUser when the DB update fails', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    await updateProfile('Ahmad', 'Muhammad');
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('returns errorResponse when auth.updateUser fails', async () => {
    mockUpdateUser.mockResolvedValue({ error: { message: 'Auth error' } });
    const result = await updateProfile('Ahmad', 'Muhammad');
    expect(result.status).toBe('error');
    expect(result.message).toBe('Auth error');
  });

  it('returns errorResponse when getUser throws unexpectedly', async () => {
    mockGetUser.mockRejectedValue(new Error('Network error'));
    const result = await updateProfile('Ahmad', 'Muhammad');
    expect(result.status).toBe('error');
    expect(result.message).toBe('Network error');
  });
});
