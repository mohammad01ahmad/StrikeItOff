import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Task, TaskInput, UseTasksResult } from '../types/task';
import {
  fetchTasks,
  addTask as apiAddTask,
  completeTask as apiCompleteTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '../api/tasks/tasks';
import { syncPendingOperations } from '../api/tasks/syncQueue';
import { enqueue, generateTempId } from '../utils/pendingQueue/pendingQueue';
import { useAuth } from '../context/authContext/authContext';

export function useTasks(): UseTasksResult {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    const response = await fetchTasks();
    if (response.status === 'error') {
      setError(response.message);
    } else if (response.data) {
      setTasks(response.data);
    }
    setLoading(false);
  }, []);

  const syncAndReload = useCallback(async () => {
    if (!session?.user.id) return;
    await syncPendingOperations(session.user.id);
    await loadTasks();
  }, [session?.user.id, loadTasks]);

  useEffect(() => {
    if (!session?.user.id) return;
    setLoading(true);
    syncAndReload();
  }, [session?.user.id, syncAndReload]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') syncAndReload();
    });
    return () => subscription.remove();
  }, [syncAndReload]);

  useEffect(() => {
    let wasOffline = false;
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isNowConnected = state.isConnected ?? false;
      if (isNowConnected && wasOffline) syncAndReload();
      if (!isNowConnected) wasOffline = true;
    });
    return () => unsubscribe();
  }, [syncAndReload]);

  const addTask = async (input: TaskInput) => {
    if (!session?.user.id) return;

    const { isConnected } = await NetInfo.fetch();

    if (!isConnected) {
      const tempId = generateTempId();
      await enqueue('create', tempId, input);
      setTasks((prev) => [
        {
          id: tempId,
          name: input.name.trim(),
          priority: input.priority,
          isDaily: input.isDaily,
          time: input.time,
          completed: false,
          pending: true,
        },
        ...prev,
      ]);
      return;
    }

    const response = await apiAddTask(session.user.id, input);
    if (response.status === 'error') {
      setError(response.message);
      return;
    }
    if (response.data) {
      setTasks((prev) => [response.data!, ...prev]);
    }
  };

  const completeTask = async (id: string) => {
    const { isConnected } = await NetInfo.fetch();

    if (!isConnected) {
      await enqueue('complete', id);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: true } : t)));
      return;
    }

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: true } : t)));
    const response = await apiCompleteTask(id);
    if (response.status === 'error') {
      setError(response.message);
      await loadTasks();
      return;
    }
    if (response.data) {
      setTasks((prev) => prev.map((t) => (t.id === id ? response.data! : t)));
    }
  };

  const updateTask = async (id: string, input: TaskInput) => {
    const { isConnected } = await NetInfo.fetch();

    if (!isConnected) {
      await enqueue('update', id, input);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, name: input.name, priority: input.priority, isDaily: input.isDaily, time: input.time }
            : t
        )
      );
      return;
    }

    const snapshot = tasks.find((t) => t.id === id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, name: input.name, priority: input.priority, isDaily: input.isDaily, time: input.time }
          : t
      )
    );
    const response = await apiUpdateTask(id, input);
    if (response.status === 'error') {
      setError(response.message);
      if (snapshot) setTasks((prev) => prev.map((t) => (t.id === id ? snapshot : t)));
      return;
    }
    if (response.data) {
      setTasks((prev) => prev.map((t) => (t.id === id ? response.data! : t)));
    }
  };

  const deleteTask = async (id: string) => {
    const { isConnected } = await NetInfo.fetch();

    if (!isConnected) {
      await enqueue('delete', id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return;
    }

    const snapshot = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const response = await apiDeleteTask(id);
    if (response.status === 'error') {
      setError(response.message);
      if (snapshot) setTasks((prev) => [snapshot, ...prev]);
    }
  };

  return { tasks, loading, error, addTask, completeTask, updateTask, deleteTask };
}
