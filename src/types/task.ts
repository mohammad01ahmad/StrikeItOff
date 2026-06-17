export type Priority = 'high' | 'medium' | 'low';

export interface Task {
    id: string;
    name: string;
    priority?: Priority;
    isDaily: boolean;
    time?: string;
    completed: boolean;
}
