// Integration tests for the useTasks hook.
// Mocks only external boundaries: the API layer and useAuth.
// babel-jest hoists jest.mock() calls before imports at runtime, so order here is fine.
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTasks } from './useTasks';
import { useAuth } from '../context/authContext/authContext';
import * as tasksApi from '../api/tasks/tasks';

jest.mock('../context/authContext/authContext', () => ({ useAuth: jest.fn() }));
jest.mock('../api/tasks', () => ({
  fetchTasks: jest.fn(),
  addTask: jest.fn(),
  completeTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockFetchTasks = tasksApi.fetchTasks as jest.Mock;
const mockAddTask = tasksApi.addTask as jest.Mock;
const mockCompleteTask = tasksApi.completeTask as jest.Mock;
const mockUpdateTask = tasksApi.updateTask as jest.Mock;
const mockDeleteTask = tasksApi.deleteTask as jest.Mock;

const SESSION = { user: { id: 'user-1' } };

const makeTask = (overrides: Record<string, unknown> = {}) => ({
  id: 'task-1',
  name: 'Test task',
  priority: undefined,
  isDaily: false,
  time: undefined,
  completed: false,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ session: SESSION });
  mockFetchTasks.mockResolvedValue([]);
});

describe('useTasks', () => {
  describe('fetchTasks', () => {
    it('loads tasks on mount and sets loading to false', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue([task]);

      const { result } = renderHook(() => useTasks());

      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.tasks).toEqual([task]);
    });

    it('does not call fetchTasks when there is no session', async () => {
      mockUseAuth.mockReturnValue({ session: null });

      renderHook(() => useTasks());

      await act(async () => { });
      expect(mockFetchTasks).not.toHaveBeenCalled();
    });

    it('sets error state when fetchTasks fails', async () => {
      mockFetchTasks.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTasks());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('addTask', () => {
    it('prepends the returned task to the list', async () => {
      const existing = makeTask({ id: 'task-0', name: 'Existing' });
      mockFetchTasks.mockResolvedValue([existing]);
      const created = makeTask({ id: 'task-2', name: 'New task' });
      mockAddTask.mockResolvedValue(created);

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addTask({ name: 'New task', isDaily: false });
      });

      expect(result.current.tasks[0]).toEqual(created);
      expect(result.current.tasks).toHaveLength(2);
    });
  });

  describe('completeTask', () => {
    it('marks the task completed optimistically before API resolves', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue([task]);
      const updatedTask = makeTask({ completed: true });
      // delay the API so we can observe the optimistic state
      mockCompleteTask.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(updatedTask), 50))
      );

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.completeTask('task-1');
      });

      expect(result.current.tasks[0].completed).toBe(true);
    });

    it('replaces the task with the server response after API resolves', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue([task]);
      const serverTask = makeTask({ completed: true, name: 'Server name' });
      mockCompleteTask.mockResolvedValue(serverTask);

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.completeTask('task-1');
      });

      expect(result.current.tasks[0]).toEqual(serverTask);
    });

    it('re-fetches tasks when the API call fails', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue([task]);
      mockCompleteTask.mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.completeTask('task-1');
      });

      // fetchTasks: once on mount, once on error revert
      expect(mockFetchTasks).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBe('Server error');
    });
  });

  describe('updateTask', () => {
    it('replaces the task in state with the server response', async () => {
      const original = makeTask({ name: 'Original' });
      mockFetchTasks.mockResolvedValue([original]);
      const serverTask = makeTask({ name: 'Updated', priority: 'high' });
      mockUpdateTask.mockResolvedValue(serverTask);

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updateTask('task-1', {
          name: 'Updated',
          priority: 'high',
          isDaily: false,
        });
      });

      expect(result.current.tasks[0]).toEqual(serverTask);
    });

    it('reverts to the original task snapshot when the API call fails', async () => {
      const original = makeTask({ name: 'Original' });
      mockFetchTasks.mockResolvedValue([original]);
      mockUpdateTask.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updateTask('task-1', { name: 'Changed', isDaily: false });
      });

      expect(result.current.tasks[0].name).toBe('Original');
      expect(result.current.error).toBe('Update failed');
    });
  });

  describe('deleteTask', () => {
    it('removes the task from state optimistically', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue([task]);
      mockDeleteTask.mockResolvedValue(undefined);

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteTask('task-1');
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    it('restores the task from snapshot when the API call fails', async () => {
      const task = makeTask({ name: 'To delete' });
      mockFetchTasks.mockResolvedValue([task]);
      mockDeleteTask.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.deleteTask('task-1');
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].name).toBe('To delete');
      expect(result.current.error).toBe('Delete failed');
    });
  });
});
