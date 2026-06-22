import { useState, useEffect, useCallback } from 'react';
import { GroceryItem } from '../types/grocery';
import {
  fetchItems,
  addItem as apiAddItem,
  toggleItem as apiToggleItem,
  deleteItem as apiDeleteItem,
  clearCheckedItems,
} from '../api/grocery/grocery';

interface UseGroceryItemsResult {
  items: GroceryItem[];
  loading: boolean;
  error: string | null;
  addItem: (name: string, quantity?: string) => Promise<void>;
  toggleItem: (id: string, checked: boolean) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearChecked: () => Promise<void>;
}

export function useGroceryItems(listId: string | null): UseGroceryItemsResult {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async (id: string) => {
    setLoading(true);
    const response = await fetchItems(id);
    if (response.status === 'error') {
      setError(response.message);
    } else if (response.data) {
      setItems(response.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!listId) {
      setItems([]);
      return;
    }
    loadItems(listId);
  }, [listId, loadItems]);

  const addItem = async (name: string, quantity?: string) => {
    if (!listId) return;
    const response = await apiAddItem(listId, name, quantity);
    if (response.status === 'error') {
      setError(response.message);
      return;
    }
    if (response.data) {
      setItems((prev) => [...prev, response.data!]);
    }
  };

  const toggleItem = async (id: string, checked: boolean) => {
    const snapshot = items.find((i) => i.id === id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)));
    const response = await apiToggleItem(id, checked);
    if (response.status === 'error') {
      setError(response.message);
      if (snapshot) setItems((prev) => prev.map((i) => (i.id === id ? snapshot : i)));
      return;
    }
    if (response.data) {
      setItems((prev) => prev.map((i) => (i.id === id ? response.data! : i)));
    }
  };

  const deleteItem = async (id: string) => {
    const snapshot = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    const response = await apiDeleteItem(id);
    if (response.status === 'error') {
      setError(response.message);
      if (snapshot) setItems((prev) => [...prev, snapshot]);
    }
  };

  const clearChecked = async () => {
    if (!listId) return;
    const snapshot = items;
    setItems((prev) => prev.filter((i) => !i.checked));
    const response = await clearCheckedItems(listId);
    if (response.status === 'error') {
      setError(response.message);
      setItems(snapshot);
    }
  };

  return { items, loading, error, addItem, toggleItem, deleteItem, clearChecked };
}
