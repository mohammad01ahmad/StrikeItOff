export type Priority = 'high' | 'medium' | 'low';

// Represents a task that we use in the application after fetching from supabase
export interface Task {
  id: string;
  name: string;
  priority?: Priority;
  isDaily: boolean;
  time?: string;
  completed: boolean;
}

// Represents a NEW task that we use in the application before sending to supabase
export interface TaskInput {
  name: string;
  priority?: Priority;
  isDaily: boolean;
  time?: string;
}

// Prop that will be used in AddTaskSheet component
export interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (input: TaskInput) => Promise<void>;
}

// Represents a row in the tasks table in Supabase
export interface TaskRow {
  id: string;
  user_id: string;
  name: string;
  priority: 'high' | 'medium' | 'low' | null;
  is_daily: boolean;
  time: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Used to create new tasks
export interface CreateTaskArgs {
  name: string;
  priority?: Priority;
  isDaily?: boolean;
  time?: string;
}

// Hook result
export interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (input: TaskInput) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  updateTask: (id: string, input: TaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}
