import { useState, useEffect, useCallback } from 'react';
import { Task, TaskInput, UseTasksResult } from '../types/task';
import { fetchTasks, addTask as apiAddTask, completeTask as apiCompleteTask } from '../api/tasks';
import { useAuth } from '../context/authContext/authContext';


export function useTasks(): UseTasksResult {

  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // loads all tasks from database
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

  // if the user changes, reload the tasks
  useEffect(() => {
    if (!session?.user.id) return;
    setLoading(true);
    loadTasks();
  }, [session?.user.id, loadTasks]);

  // calls addTask in api/tasks and adds the task to the state
  const addTask = async (input: TaskInput) => {
    if (!session?.user.id) return;
    const task = await apiAddTask(session.user.id, input);
    setTasks((prev) => [task, ...prev]);
  };

  // calls apiCompleteTask and updates the state
  const completeTask = async (id: string) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: true } : t)));
    try {
      const updated = await apiCompleteTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: any) {
      // Revert and re-fetch on error
      setError(err.message ?? 'Failed to complete task.');
      await loadTasks();
    }
  };

  return { tasks, loading, error, addTask, completeTask };
}
