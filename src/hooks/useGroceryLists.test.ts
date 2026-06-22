import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGroceryLists } from './useGroceryLists';
import { useAuth } from '../context/authContext/authContext';
import * as groceryApi from '../api/grocery/grocery';

jest.mock('../context/authContext/authContext', () => ({ useAuth: jest.fn() }));
jest.mock('../api/grocery/grocery', () => ({
  fetchLists: jest.fn(),
  createList: jest.fn(),
  deleteList: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockFetchLists = groceryApi.fetchLists as jest.Mock;
const mockCreateList = groceryApi.createList as jest.Mock;
const mockDeleteList = groceryApi.deleteList as jest.Mock;

const SESSION = { user: { id: 'user-1' } };
const ok = <T>(data: T) => ({ status: 'success' as const, data, message: 'OK', code: 200 });
const fail = (msg: string) => ({ status: 'error' as const, message: msg, code: 400 });

const makeList = (overrides: Record<string, unknown> = {}) => ({
  id: 'list-1',
  name: 'Weekly Shop',
  totalCount: 0,
  checkedCount: 0,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ session: SESSION });
  mockFetchLists.mockResolvedValue(ok([]));
});

describe('useGroceryLists', () => {
  describe('initial load', () => {
    it('loads lists on mount and sets loading to false', async () => {
      const list = makeList();
      mockFetchLists.mockResolvedValue(ok([list]));

      const { result } = renderHook(() => useGroceryLists());

      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.lists).toEqual([list]);
    });

    it('does not call fetchLists when there is no session', async () => {
      mockUseAuth.mockReturnValue({ session: null });
      renderHook(() => useGroceryLists());
      await act(async () => {});
      expect(mockFetchLists).not.toHaveBeenCalled();
    });

    it('sets error when fetchLists returns an error', async () => {
      mockFetchLists.mockResolvedValue(fail('DB error'));
      const { result } = renderHook(() => useGroceryLists());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('DB error');
    });
  });

  describe('createList', () => {
    it('prepends the new list to state', async () => {
      const existing = makeList({ id: 'list-0', name: 'Old list' });
      mockFetchLists.mockResolvedValue(ok([existing]));
      const created = makeList({ id: 'list-2', name: 'New list' });
      mockCreateList.mockResolvedValue(ok(created));

      const { result } = renderHook(() => useGroceryLists());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.createList('New list'); });

      expect(result.current.lists[0]).toEqual(created);
      expect(result.current.lists).toHaveLength(2);
    });

    it('calls createList with userId and trimmed name', async () => {
      mockCreateList.mockResolvedValue(ok(makeList()));
      const { result } = renderHook(() => useGroceryLists());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.createList('  Lidl run  '); });

      expect(mockCreateList).toHaveBeenCalledWith('user-1', '  Lidl run  ');
    });

    it('sets error when createList fails', async () => {
      mockCreateList.mockResolvedValue(fail('Insert failed'));
      const { result } = renderHook(() => useGroceryLists());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.createList('Shop'); });

      expect(result.current.error).toBe('Insert failed');
    });
  });

  describe('deleteList', () => {
    it('removes the list from state optimistically', async () => {
      const list = makeList();
      mockFetchLists.mockResolvedValue(ok([list]));
      mockDeleteList.mockResolvedValue(ok(undefined));

      const { result } = renderHook(() => useGroceryLists());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.deleteList('list-1'); });

      expect(result.current.lists).toHaveLength(0);
    });

    it('restores the list from snapshot when the API fails', async () => {
      const list = makeList({ name: 'To delete' });
      mockFetchLists.mockResolvedValue(ok([list]));
      mockDeleteList.mockResolvedValue(fail('Delete failed'));

      const { result } = renderHook(() => useGroceryLists());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.deleteList('list-1'); });

      expect(result.current.lists).toHaveLength(1);
      expect(result.current.error).toBe('Delete failed');
    });
  });
});
