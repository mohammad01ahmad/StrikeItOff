import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGroceryItems } from './useGroceryItems';
import * as groceryApi from '../api/grocery/grocery';

jest.mock('../api/grocery/grocery', () => ({
  fetchItems: jest.fn(),
  addItem: jest.fn(),
  toggleItem: jest.fn(),
  deleteItem: jest.fn(),
  clearCheckedItems: jest.fn(),
}));

const mockFetchItems = groceryApi.fetchItems as jest.Mock;
const mockAddItem = groceryApi.addItem as jest.Mock;
const mockToggleItem = groceryApi.toggleItem as jest.Mock;
const mockDeleteItem = groceryApi.deleteItem as jest.Mock;
const mockClearChecked = groceryApi.clearCheckedItems as jest.Mock;

const ok = <T>(data: T) => ({ status: 'success' as const, data, message: 'OK', code: 200 });
const fail = (msg: string) => ({ status: 'error' as const, message: msg, code: 400 });

const makeItem = (overrides: Record<string, unknown> = {}) => ({
  id: 'item-1',
  listId: 'list-1',
  name: 'Pasta',
  quantity: undefined,
  checked: false,
  ...overrides,
});

const LIST_ID = 'list-1';

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchItems.mockResolvedValue(ok([]));
});

describe('useGroceryItems', () => {
  describe('initial load', () => {
    it('loads items when a listId is provided', async () => {
      const item = makeItem();
      mockFetchItems.mockResolvedValue(ok([item]));

      const { result } = renderHook(() => useGroceryItems(LIST_ID));

      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.items).toEqual([item]);
      expect(mockFetchItems).toHaveBeenCalledWith(LIST_ID);
    });

    it('does not fetch when listId is null', async () => {
      const { result } = renderHook(() => useGroceryItems(null));
      await act(async () => {});
      expect(mockFetchItems).not.toHaveBeenCalled();
      expect(result.current.items).toEqual([]);
    });

    it('reloads when listId changes', async () => {
      const { rerender } = renderHook(({ id }) => useGroceryItems(id), {
        initialProps: { id: 'list-1' as string | null },
      });
      await waitFor(() => expect(mockFetchItems).toHaveBeenCalledTimes(1));

      rerender({ id: 'list-2' });
      await waitFor(() => expect(mockFetchItems).toHaveBeenCalledWith('list-2'));
    });

    it('sets error when fetchItems returns an error', async () => {
      mockFetchItems.mockResolvedValue(fail('DB error'));
      const { result } = renderHook(() => useGroceryItems(LIST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('DB error');
    });
  });

  describe('addItem', () => {
    it('appends the new item to state', async () => {
      const existing = makeItem({ id: 'item-0', name: 'Bread' });
      mockFetchItems.mockResolvedValue(ok([existing]));
      const created = makeItem({ id: 'item-2', name: 'Milk', quantity: '1L' });
      mockAddItem.mockResolvedValue(ok(created));

      const { result } = renderHook(() => useGroceryItems(LIST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.addItem('Milk', '1L'); });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[1]).toEqual(created);
    });

    it('calls addItem with listId, name, and quantity', async () => {
      mockAddItem.mockResolvedValue(ok(makeItem()));
      const { result } = renderHook(() => useGroceryItems(LIST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.addItem('Eggs', '12'); });

      expect(mockAddItem).toHaveBeenCalledWith(LIST_ID, 'Eggs', '12');
    });

    it('sets error when addItem fails', async () => {
      mockAddItem.mockResolvedValue(fail('Insert failed'));
      const { result } = renderHook(() => useGroceryItems(LIST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.addItem('Milk'); });

      expect(result.current.error).toBe('Insert failed');
    });
  });

  describe('toggleItem', () => {
    it('updates the item in state with the server response', async () => {
      const item = makeItem({ checked: false });
      mockFetchItems.mockResolvedValue(ok([item]));
      const toggled = makeItem({ checked: true });
      mockToggleItem.mockResolvedValue(ok(toggled));

      const { result } = renderHook(() => useGroceryItems(LIST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.toggleItem('item-1', true); });

      expect(result.current.items[0].checked).toBe(true);
    });

    it('reverts to original on toggle failure', async () => {
      const item = makeItem({ checked: false });
      mockFetchItems.mockResolvedValue(ok([item]));
      mockToggleItem.mockResolvedValue(fail('Update failed'));

      const { result } = renderHook(() => useGroceryItems(LIST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.toggleItem('item-1', true); });

      expect(result.current.items[0].checked).toBe(false);
      expect(result.current.error).toBe('Update failed');
    });
  });

  describe('deleteItem', () => {
    it('removes the item from state optimistically', async () => {
      const item = makeItem();
      mockFetchItems.mockResolvedValue(ok([item]));
      mockDeleteItem.mockResolvedValue(ok(undefined));

      const { result } = renderHook(() => useGroceryItems(LIST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.deleteItem('item-1'); });

      expect(result.current.items).toHaveLength(0);
    });

    it('restores item from snapshot when delete fails', async () => {
      const item = makeItem({ name: 'Pasta' });
      mockFetchItems.mockResolvedValue(ok([item]));
      mockDeleteItem.mockResolvedValue(fail('Delete failed'));

      const { result } = renderHook(() => useGroceryItems(LIST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.deleteItem('item-1'); });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.error).toBe('Delete failed');
    });
  });

  describe('clearChecked', () => {
    it('removes all checked items from state optimistically', async () => {
      const unchecked = makeItem({ id: 'item-1', checked: false });
      const checked1 = makeItem({ id: 'item-2', name: 'Bread', checked: true });
      const checked2 = makeItem({ id: 'item-3', name: 'Milk', checked: true });
      mockFetchItems.mockResolvedValue(ok([unchecked, checked1, checked2]));
      mockClearChecked.mockResolvedValue(ok(undefined));

      const { result } = renderHook(() => useGroceryItems(LIST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.clearChecked(); });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('item-1');
    });

    it('restores checked items when clearChecked fails', async () => {
      const checked = makeItem({ id: 'item-2', checked: true });
      mockFetchItems.mockResolvedValue(ok([checked]));
      mockClearChecked.mockResolvedValue(fail('Clear failed'));

      const { result } = renderHook(() => useGroceryItems(LIST_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.clearChecked(); });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.error).toBe('Clear failed');
    });
  });
});
