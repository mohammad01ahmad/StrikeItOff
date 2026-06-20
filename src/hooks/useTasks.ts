import { useState, useEffect, useCallback } from 'react';
import { Task, TaskInput, UseTasksResult } from '../types/task';
import {
  fetchTasks,
  addTask as apiAddTask,
  completeTask as apiCompleteTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '../api/tasks';
import { useAuth } from '../context/authContext/authContext';

// file: The functions in this use the API functions from ./api/tasks
// No business logic is in this file 
// this file is just for having CRUD functions with state

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

  useEffect(() => {
    if (!session?.user.id) return;
    setLoading(true);
    loadTasks();
  }, [session?.user.id, loadTasks]);

  const addTask = async (input: TaskInput) => {
    if (!session?.user.id) return;
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
