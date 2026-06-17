import { Task, Priority } from '../types/task';

interface CreateTaskInput {
    name: string;
    priority?: Priority;
    isDaily?: boolean;
    time?: string;
}

let counter = 0;

export function createTask({ name, priority, isDaily = false, time }: CreateTaskInput): Task {
    return {
        id: `${Date.now()}-${++counter}`,
        name: name.trim(),
        priority,
        isDaily,
        time: time?.trim() || undefined,
        completed: false,
    };
}
