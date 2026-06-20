import { supabase } from '../../lib/supabase';
import { Task, TaskInput, TaskRow } from '../types/task';

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function rowToTask(row: TaskRow, now: Date = new Date()): Task {
  let completed = false;
  if (row.completed_at !== null) {
    if (row.is_daily) {
      completed = isSameLocalDay(new Date(row.completed_at), now);
    } else {
      completed = true;
    }
  }

  return {
    id: row.id,
    name: row.name.trim(),
    priority: row.priority ?? undefined,
    isDaily: row.is_daily,
    time: row.time ?? undefined,
    completed,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const now = new Date();
  return (data as TaskRow[]).map((row) => rowToTask(row, now));
}

export async function addTask(userId: string, input: TaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      name: input.name.trim(),
      priority: input.priority ?? null,
      is_daily: input.isDaily,
      time: input.time?.trim() || null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToTask(data as TaskRow);
}

export async function completeTask(id: string): Promise<Task> {
  const now = new Date();
  const { data, error } = await supabase
    .from('tasks')
    .update({ completed_at: now.toISOString(), updated_at: now.toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToTask(data as TaskRow, now);
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const now = new Date();
  const { data, error } = await supabase
    .from('tasks')
    .update({
      name: input.name.trim(),
      priority: input.priority ?? null,
      is_daily: input.isDaily,
      time: input.time?.trim() || null,
      updated_at: now.toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToTask(data as TaskRow);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}
