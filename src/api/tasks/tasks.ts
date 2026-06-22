import { supabase } from '../../../lib/supabase';
import { Task, TaskInput, TaskRow } from '../../types/task';
import { ApiResponse, successResponse, errorResponse } from "../../utils/apiResponse/apiResponse"

// file: contains business logic functions 
// direct interaction with supabase
// there is no state handling of any type in this file

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

export async function fetchTasks(): Promise<ApiResponse<Task[]>> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return errorResponse(error.message, 400);
    if (!data) return errorResponse('Failed to fetch tasks.', 500);

    const now = new Date();
    const visibleRows = (data as TaskRow[]).filter(
      (row) => row.is_daily || isSameLocalDay(new Date(row.created_at), now)
    );
    return successResponse('Tasks fetched successfully.', visibleRows.map((row) => rowToTask(row, now)));
  } catch (err: any) {
    const fallbackMessage = err instanceof Error ? err.message : 'Failed to fetch tasks.';
    return errorResponse(fallbackMessage, 500);
  }
}

export async function addTask(userId: string, input: TaskInput): Promise<ApiResponse<Task>> {
  try {
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

    if (error) return errorResponse(error.message, 400);
    if (!data) return errorResponse('Task could not be retrieved after creation.', 500);

    return successResponse('Task created successfully.', rowToTask(data as TaskRow), 201);
  } catch (err: any) {
    const fallbackMessage = err instanceof Error ? err.message : 'Failed to create task.';
    return errorResponse(fallbackMessage, 500);
  }
}

export async function completeTask(id: string): Promise<ApiResponse<Task>> {
  const now = new Date();
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed_at: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return errorResponse(error.message, 400);
    if (!data) return errorResponse('Task could not be retrieved after completing.', 500);

    return successResponse('Task completed successfully.', rowToTask(data as TaskRow, now));
  } catch (err: any) {
    const fallbackMessage = err instanceof Error ? err.message : 'Failed to complete task.';
    return errorResponse(fallbackMessage, 500);
  }
}

export async function updateTask(id: string, input: TaskInput): Promise<ApiResponse<Task>> {
  try {
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

    if (error) return errorResponse(error.message, 400);
    if (!data) return errorResponse('Task could not be retrieved after updating.', 500);

    return successResponse('Task updated successfully.', rowToTask(data as TaskRow));
  } catch (err: any) {
    const fallbackMessage = err instanceof Error ? err.message : 'Failed to update task.';
    return errorResponse(fallbackMessage, 500);
  }
}

export async function deleteTask(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) return errorResponse(error.message, 400);
    return successResponse('Task deleted successfully.');
  } catch (err: any) {
    const fallbackMessage = err instanceof Error ? err.message : 'Failed to delete task.';
    return errorResponse(fallbackMessage, 500);
  }
}
