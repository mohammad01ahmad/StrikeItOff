import { supabase } from '../../../lib/supabase';
import { GroceryList, GroceryItem, GroceryListRow, GroceryItemRow } from '../../types/grocery';
import { ApiResponse, successResponse, errorResponse } from '../../utils/apiResponse/apiResponse';

export function rowToList(row: GroceryListRow): GroceryList {
  return {
    id: row.id,
    name: row.name.trim(),
    totalCount: row.grocery_items.length,
    checkedCount: row.grocery_items.filter((i) => i.checked).length,
  };
}

export function rowToItem(row: GroceryItemRow): GroceryItem {
  return {
    id: row.id,
    listId: row.list_id,
    name: row.name.trim(),
    quantity: row.quantity ?? undefined,
    checked: row.checked,
  };
}

export async function fetchLists(): Promise<ApiResponse<GroceryList[]>> {
  try {
    const { data, error } = await supabase
      .from('grocery_lists')
      .select('id, name, created_at, grocery_items(id, checked)')
      .order('created_at', { ascending: false });

    if (error) return errorResponse(error.message);
    if (!data) return errorResponse('Failed to fetch grocery lists.', 500);

    return successResponse('Lists fetched.', (data as GroceryListRow[]).map(rowToList));
  } catch (err: any) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to fetch grocery lists.', 500);
  }
}

export async function createList(userId: string, name: string): Promise<ApiResponse<GroceryList>> {
  try {
    const { data, error } = await supabase
      .from('grocery_lists')
      .insert({ user_id: userId, name: name.trim() })
      .select('id, name, created_at')
      .single();

    if (error) return errorResponse(error.message);
    if (!data) return errorResponse('Failed to retrieve list after creation.', 500);

    return successResponse('List created.', rowToList({ ...data, grocery_items: [] }), 201);
  } catch (err: any) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to create list.', 500);
  }
}

export async function deleteList(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase.from('grocery_lists').delete().eq('id', id);
    if (error) return errorResponse(error.message);
    return successResponse('List deleted.');
  } catch (err: any) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to delete list.', 500);
  }
}

export async function fetchItems(listId: string): Promise<ApiResponse<GroceryItem[]>> {
  try {
    const { data, error } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: true });

    if (error) return errorResponse(error.message);
    if (!data) return errorResponse('Failed to fetch items.', 500);

    return successResponse('Items fetched.', (data as GroceryItemRow[]).map(rowToItem));
  } catch (err: any) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to fetch items.', 500);
  }
}

export async function addItem(
  listId: string,
  name: string,
  quantity?: string
): Promise<ApiResponse<GroceryItem>> {
  try {
    const { data, error } = await supabase
      .from('grocery_items')
      .insert({ list_id: listId, name: name.trim(), quantity: quantity?.trim() || null })
      .select()
      .single();

    if (error) return errorResponse(error.message);
    if (!data) return errorResponse('Failed to retrieve item after creation.', 500);

    return successResponse('Item added.', rowToItem(data as GroceryItemRow), 201);
  } catch (err: any) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to add item.', 500);
  }
}

export async function toggleItem(id: string, checked: boolean): Promise<ApiResponse<GroceryItem>> {
  try {
    const { data, error } = await supabase
      .from('grocery_items')
      .update({ checked })
      .eq('id', id)
      .select()
      .single();

    if (error) return errorResponse(error.message);
    if (!data) return errorResponse('Failed to retrieve item after update.', 500);

    return successResponse('Item updated.', rowToItem(data as GroceryItemRow));
  } catch (err: any) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to toggle item.', 500);
  }
}

export async function deleteItem(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase.from('grocery_items').delete().eq('id', id);
    if (error) return errorResponse(error.message);
    return successResponse('Item deleted.');
  } catch (err: any) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to delete item.', 500);
  }
}

export async function clearCheckedItems(listId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('list_id', listId)
      .eq('checked', true);

    if (error) return errorResponse(error.message);
    return successResponse('Checked items cleared.');
  } catch (err: any) {
    return errorResponse(err instanceof Error ? err.message : 'Failed to clear items.', 500);
  }
}
