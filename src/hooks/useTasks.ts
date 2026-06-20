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

// File: Contains all the functions for task CRUD
// Functions take reference from @src/api/tasks

export function useTasks(): UseTasksResult {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user.id) return;
    setLoading(true);
    loadTasks();
  }, [session?.user.id, loadTasks]);

  const addTask = async (input: TaskInput) => {
    if (!session?.user.id) return;
    const task = await apiAddTask(session.user.id, input);
    setTasks((prev) => [task, ...prev]);
  };

  const completeTask = async (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: true } : t)));
    try {
      const updated = await apiCompleteTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: any) {
      setError(err.message ?? 'Failed to complete task.');
      await loadTasks();
    }
  };

  const updateTask = async (id: string, input: TaskInput) => {
    const snapshot = tasks.find((t) => t.id === id);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              name: input.name,
              priority: input.priority,
              isDaily: input.isDaily,
              time: input.time,
            }
          : t
      )
    );
    try {
      const updated = await apiUpdateTask(id, input);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: any) {
      setError(err.message ?? 'Failed to update task.');
      if (snapshot) setTasks((prev) => prev.map((t) => (t.id === id ? snapshot : t)));
    }
  };

  const deleteTask = async (id: string) => {
    const snapshot = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await apiDeleteTask(id);
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete task.');
      if (snapshot) setTasks((prev) => [snapshot, ...prev]);
    }
  };

  return { tasks, loading, error, addTask, completeTask, updateTask, deleteTask };
}
