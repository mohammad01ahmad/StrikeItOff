import { rowToList, rowToItem } from './grocery';

jest.mock('../../../lib/supabase', () => ({ supabase: {} }));

const BASE_LIST_ROW = {
  id: 'list-1',
  user_id: 'user-1',
  name: 'Weekly Shop',
  created_at: '2026-06-22T10:00:00Z',
  grocery_items: [],
};

const BASE_ITEM_ROW = {
  id: 'item-1',
  list_id: 'list-1',
  name: 'Pasta',
  quantity: null as string | null,
  checked: false,
  created_at: '2026-06-22T10:00:00Z',
};

describe('rowToList', () => {
  it('maps id and name', () => {
    const list = rowToList(BASE_LIST_ROW);
    expect(list.id).toBe('list-1');
    expect(list.name).toBe('Weekly Shop');
  });

  it('returns totalCount 0 and checkedCount 0 when there are no items', () => {
    const list = rowToList({ ...BASE_LIST_ROW, grocery_items: [] });
    expect(list.totalCount).toBe(0);
    expect(list.checkedCount).toBe(0);
  });

  it('computes totalCount from all items', () => {
    const items = [
      { id: 'i-1', checked: false },
      { id: 'i-2', checked: true },
      { id: 'i-3', checked: false },
    ];
    const list = rowToList({ ...BASE_LIST_ROW, grocery_items: items });
    expect(list.totalCount).toBe(3);
  });

  it('computes checkedCount from only checked items', () => {
    const items = [
      { id: 'i-1', checked: true },
      { id: 'i-2', checked: false },
      { id: 'i-3', checked: true },
    ];
    const list = rowToList({ ...BASE_LIST_ROW, grocery_items: items });
    expect(list.checkedCount).toBe(2);
  });

  it('trims whitespace from name', () => {
    const list = rowToList({ ...BASE_LIST_ROW, name: '  Lidl run  ' });
    expect(list.name).toBe('Lidl run');
  });
});

describe('rowToItem', () => {
  it('maps id, listId, name, and checked', () => {
    const item = rowToItem(BASE_ITEM_ROW);
    expect(item.id).toBe('item-1');
    expect(item.listId).toBe('list-1');
    expect(item.name).toBe('Pasta');
    expect(item.checked).toBe(false);
  });

  it('maps quantity when present', () => {
    const item = rowToItem({ ...BASE_ITEM_ROW, quantity: '2 packs' });
    expect(item.quantity).toBe('2 packs');
  });

  it('omits quantity when null', () => {
    const item = rowToItem({ ...BASE_ITEM_ROW, quantity: null });
    expect(item.quantity).toBeUndefined();
  });

  it('trims whitespace from name', () => {
    const item = rowToItem({ ...BASE_ITEM_ROW, name: '  Milk  ' });
    expect(item.name).toBe('Milk');
  });

  it('reflects the checked state correctly', () => {
    const checked = rowToItem({ ...BASE_ITEM_ROW, checked: true });
    expect(checked.checked).toBe(true);
  });
});
