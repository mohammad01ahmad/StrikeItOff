import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTasks } from './useTasks';
import { useAuth } from '../../context/authContext/authContext';
import * as tasksApi from '../../api/tasks/tasks';
import * as syncQueueModule from '../../api/tasks/syncQueue';
import * as pendingQueue from '../../utils/pendingQueue/pendingQueue';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../context/authContext/authContext', () => ({ useAuth: jest.fn() }));
jest.mock('../api/tasks/tasks', () => ({
  fetchTasks: jest.fn(),
  addTask: jest.fn(),
  completeTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));
jest.mock('../api/tasks/syncQueue', () => ({ syncPendingOperations: jest.fn() }));
jest.mock('../utils/pendingQueue/pendingQueue', () => ({
  enqueue: jest.fn(),
  generateTempId: jest.fn(),
}));
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockFetchTasks = tasksApi.fetchTasks as jest.Mock;
const mockAddTask = tasksApi.addTask as jest.Mock;
const mockCompleteTask = tasksApi.completeTask as jest.Mock;
const mockUpdateTask = tasksApi.updateTask as jest.Mock;
const mockDeleteTask = tasksApi.deleteTask as jest.Mock;
const mockSync = syncQueueModule.syncPendingOperations as jest.Mock;
const mockEnqueue = pendingQueue.enqueue as jest.Mock;
const mockGenerateTempId = pendingQueue.generateTempId as jest.Mock;
const mockNetInfoFetch = NetInfo.fetch as jest.Mock;
const mockNetInfoAddEventListener = NetInfo.addEventListener as jest.Mock;

const SESSION = { user: { id: 'user-1' } };

const ok = <T>(data: T) => ({ status: 'success' as const, data, message: 'OK' });
const fail = (msg: string) => ({ status: 'error' as const, data: null, message: msg });

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
  mockFetchTasks.mockResolvedValue(ok([]));
  mockSync.mockResolvedValue(0);
  mockEnqueue.mockResolvedValue({ id: 'op-1' });
  mockGenerateTempId.mockReturnValue('pending-temp-1');
  mockNetInfoFetch.mockResolvedValue({ isConnected: true });
  mockNetInfoAddEventListener.mockReturnValue(jest.fn()); // returns unsubscribe
});

describe('useTasks', () => {
  describe('initial load', () => {
    it('loads tasks on mount and sets loading to false', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue(ok([task]));

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

    it('sets error state when fetchTasks returns an error response', async () => {
      mockFetchTasks.mockResolvedValue(fail('Network error'));

      const { result } = renderHook(() => useTasks());

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe('Network error');
    });

    it('runs syncPendingOperations before loading tasks on mount', async () => {
      const callOrder: string[] = [];
      mockSync.mockImplementation(async () => { callOrder.push('sync'); return 0; });
      mockFetchTasks.mockImplementation(async () => { callOrder.push('fetch'); return ok([]); });

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(callOrder).toEqual(['sync', 'fetch']);
    });
  });

  describe('addTask — online', () => {
    it('prepends the returned task to the list', async () => {
      const existing = makeTask({ id: 'task-0', name: 'Existing' });
      mockFetchTasks.mockResolvedValue(ok([existing]));
      const created = makeTask({ id: 'task-2', name: 'New task' });
      mockAddTask.mockResolvedValue(ok(created));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addTask({ name: 'New task', isDaily: false });
      });

      expect(result.current.tasks[0]).toEqual(created);
      expect(result.current.tasks).toHaveLength(2);
    });

    it('sets error when addTask returns an error response', async () => {
      mockAddTask.mockResolvedValue(fail('Insert failed'));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addTask({ name: 'Task', isDaily: false });
      });

      expect(result.current.error).toBe('Insert failed');
    });
  });

  describe('addTask — offline', () => {
    beforeEach(() => {
      mockNetInfoFetch.mockResolvedValue({ isConnected: false });
    });

    it('enqueues a create operation with the temp ID and input', async () => {
      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addTask({ name: 'Offline task', isDaily: false });
      });

      expect(mockEnqueue).toHaveBeenCalledWith(
        'create',
        'pending-temp-1',
        { name: 'Offline task', isDaily: false }
      );
    });

    it('adds a pending task to state with the temp ID', async () => {
      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addTask({ name: 'Offline task', isDaily: false });
      });

      expect(result.current.tasks[0].id).toBe('pending-temp-1');
      expect(result.current.tasks[0].pending).toBe(true);
    });

    it('does not call Supabase addTask', async () => {
      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addTask({ name: 'Offline task', isDaily: false });
      });

      expect(mockAddTask).not.toHaveBeenCalled();
    });
  });

  describe('completeTask — online', () => {
    it('marks the task completed optimistically before the API resolves', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue(ok([task]));
      mockCompleteTask.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(ok(makeTask({ completed: true }))), 50))
      );

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => { result.current.completeTask('task-1'); });

      await waitFor(() => expect(result.current.tasks[0].completed).toBe(true));
    });

    it('replaces the task with the server response after API resolves', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue(ok([task]));
      const serverTask = makeTask({ completed: true, name: 'Server name' });
      mockCompleteTask.mockResolvedValue(ok(serverTask));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.completeTask('task-1'); });

      expect(result.current.tasks[0]).toEqual(serverTask);
    });

    it('re-fetches tasks and sets error when the API returns an error', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue(ok([task]));
      mockCompleteTask.mockResolvedValue(fail('Server error'));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.completeTask('task-1'); });

      expect(mockFetchTasks).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBe('Server error');
    });
  });

  describe('completeTask — offline', () => {
    beforeEach(() => {
      mockNetInfoFetch.mockResolvedValue({ isConnected: false });
    });

    it('enqueues a complete operation', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue(ok([task]));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.completeTask('task-1'); });

      expect(mockEnqueue).toHaveBeenCalledWith('complete', 'task-1');
    });

    it('marks the task completed in state without calling Supabase', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue(ok([task]));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.completeTask('task-1'); });

      expect(result.current.tasks[0].completed).toBe(true);
      expect(mockCompleteTask).not.toHaveBeenCalled();
    });
  });

  describe('updateTask — online', () => {
    it('replaces the task in state with the server response', async () => {
      const original = makeTask({ name: 'Original' });
      mockFetchTasks.mockResolvedValue(ok([original]));
      const serverTask = makeTask({ name: 'Updated', priority: 'high' });
      mockUpdateTask.mockResolvedValue(ok(serverTask));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updateTask('task-1', { name: 'Updated', priority: 'high', isDaily: false });
      });

      expect(result.current.tasks[0]).toEqual(serverTask);
    });

    it('reverts to the snapshot when the API returns an error', async () => {
      const original = makeTask({ name: 'Original' });
      mockFetchTasks.mockResolvedValue(ok([original]));
      mockUpdateTask.mockResolvedValue(fail('Update failed'));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updateTask('task-1', { name: 'Changed', isDaily: false });
      });

      expect(result.current.tasks[0].name).toBe('Original');
      expect(result.current.error).toBe('Update failed');
    });
  });

  describe('updateTask — offline', () => {
    beforeEach(() => {
      mockNetInfoFetch.mockResolvedValue({ isConnected: false });
    });

    it('enqueues an update operation', async () => {
      const task = makeTask({ name: 'Original' });
      mockFetchTasks.mockResolvedValue(ok([task]));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const input = { name: 'Updated', isDaily: false };
      await act(async () => { await result.current.updateTask('task-1', input); });

      expect(mockEnqueue).toHaveBeenCalledWith('update', 'task-1', input);
    });

    it('updates the task in state without calling Supabase', async () => {
      const task = makeTask({ name: 'Original' });
      mockFetchTasks.mockResolvedValue(ok([task]));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.updateTask('task-1', { name: 'Updated', isDaily: false });
      });

      expect(result.current.tasks[0].name).toBe('Updated');
      expect(mockUpdateTask).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask — online', () => {
    it('removes the task from state optimistically', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue(ok([task]));
      mockDeleteTask.mockResolvedValue(ok(null));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.deleteTask('task-1'); });

      expect(result.current.tasks).toHaveLength(0);
    });

    it('restores the task from snapshot when the API returns an error', async () => {
      const task = makeTask({ name: 'To delete' });
      mockFetchTasks.mockResolvedValue(ok([task]));
      mockDeleteTask.mockResolvedValue(fail('Delete failed'));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.deleteTask('task-1'); });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].name).toBe('To delete');
      expect(result.current.error).toBe('Delete failed');
    });
  });

  describe('deleteTask — offline', () => {
    beforeEach(() => {
      mockNetInfoFetch.mockResolvedValue({ isConnected: false });
    });

    it('enqueues a delete operation', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue(ok([task]));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.deleteTask('task-1'); });

      expect(mockEnqueue).toHaveBeenCalledWith('delete', 'task-1');
    });

    it('removes the task from state without calling Supabase', async () => {
      const task = makeTask();
      mockFetchTasks.mockResolvedValue(ok([task]));

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.deleteTask('task-1'); });

      expect(result.current.tasks).toHaveLength(0);
      expect(mockDeleteTask).not.toHaveBeenCalled();
    });
  });

  describe('sync on reconnect', () => {
    it('registers a NetInfo listener on mount and cleans it up on unmount', () => {
      const unsubscribe = jest.fn();
      mockNetInfoAddEventListener.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useTasks());
      expect(mockNetInfoAddEventListener).toHaveBeenCalled();

      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });

    it('calls syncAndReload when connectivity transitions from offline to online', async () => {
      let capturedListener: ((state: { isConnected: boolean }) => void) | null = null;
      mockNetInfoAddEventListener.mockImplementation((listener) => {
        capturedListener = listener;
        return jest.fn();
      });

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const fetchCallsBefore = mockFetchTasks.mock.calls.length;

      await act(async () => {
        capturedListener!({ isConnected: false });
        capturedListener!({ isConnected: true });
      });

      await waitFor(() => {
        expect(mockFetchTasks.mock.calls.length).toBeGreaterThan(fetchCallsBefore);
      });
      expect(mockSync).toHaveBeenCalled();
    });

    it('does not sync when already online on initial NetInfo fire', async () => {
      let capturedListener: ((state: { isConnected: boolean }) => void) | null = null;
      mockNetInfoAddEventListener.mockImplementation((listener) => {
        capturedListener = listener;
        return jest.fn();
      });

      const { result } = renderHook(() => useTasks());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const syncCallsBefore = mockSync.mock.calls.length;

      await act(async () => {
        capturedListener!({ isConnected: true });
      });

      expect(mockSync.mock.calls.length).toBe(syncCallsBefore);
    });
  });
});
