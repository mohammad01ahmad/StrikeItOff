import { useState, useEffect, useCallback } from 'react';
import { GroceryList } from '@/types/grocery';
import { fetchLists, createList as apiCreateList, deleteList as apiDeleteList } from '@/api/grocery/grocery';
import { useAuth } from '@/context/authContext/authContext';

interface UseGroceryListsResult {
  lists: GroceryList[];
  loading: boolean;
  error: string | null;
  createList: (name: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
}

export function useGroceryLists(): UseGroceryListsResult {
  const { session } = useAuth();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLists = useCallback(async () => {
    const response = await fetchLists();
    if (response.status === 'error') {
      setError(response.message);
    } else if (response.data) {
      setLists(response.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!session?.user.id) return;
    setLoading(true);
    loadLists();
  }, [session?.user.id, loadLists]);

  const createList = async (name: string) => {
    if (!session?.user.id) return;
    const response = await apiCreateList(session.user.id, name);
    if (response.status === 'error') {
      setError(response.message);
      return;
    }
    if (response.data) {
      setLists((prev) => [response.data!, ...prev]);
    }
  };

  const deleteList = async (id: string) => {
    const snapshot = lists.find((l) => l.id === id);
    setLists((prev) => prev.filter((l) => l.id !== id));
    const response = await apiDeleteList(id);
    if (response.status === 'error') {
      setError(response.message);
      if (snapshot) setLists((prev) => [snapshot, ...prev]);
    }
  };

  return { lists, loading, error, createList, deleteList };
}
