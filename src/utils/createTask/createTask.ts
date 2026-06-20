import { TaskInput, CreateTaskArgs } from '../../types/task';

export function createTask({ name, priority, isDaily = false, time }: CreateTaskArgs): TaskInput {
  return {
    name: name.trim(),
    priority,
    isDaily,
    time: time?.trim() || undefined,
  };
}
