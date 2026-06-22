export interface GroceryList {
  id: string;
  name: string;
  totalCount: number;
  checkedCount: number;
}

export interface GroceryItem {
  id: string;
  listId: string;
  name: string;
  quantity?: string;
  checked: boolean;
}

export interface GroceryListRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  grocery_items: Array<{ id: string; checked: boolean }>;
}

export interface GroceryItemRow {
  id: string;
  list_id: string;
  name: string;
  quantity: string | null;
  checked: boolean;
  created_at: string;
}
