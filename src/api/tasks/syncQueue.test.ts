import { syncPendingOperations } from './syncQueue';
import * as tasksApi from './tasks';
import * as queue from '../../utils/pendingQueue/pendingQueue';

jest.mock('./tasks', () => ({
  addTask: jest.fn(),
  completeTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

jest.mock('../../utils/pendingQueue/pendingQueue', () => ({
  getAll: jest.fn(),
  remove: jest.fn(),
}));

const mockGetAll = queue.getAll as jest.Mock;
const mockRemove = queue.remove as jest.Mock;
const mockAddTask = tasksApi.addTask as jest.Mock;
const mockCompleteTask = tasksApi.completeTask as jest.Mock;
const mockUpdateTask = tasksApi.updateTask as jest.Mock;
const mockDeleteTask = tasksApi.deleteTask as jest.Mock;

const USER_ID = 'user-1';
const ok = (data: unknown) => ({ status: 'success' as const, data, message: 'OK' });
const fail = () => ({ status: 'error' as const, data: null, message: 'Failed' });

beforeEach(() => {
  jest.clearAllMocks();
  mockRemove.mockResolvedValue(undefined);
});

describe('syncPendingOperations', () => {
  it('returns 0 when the queue is empty', async () => {
    mockGetAll.mockResolvedValue([]);
    expect(await syncPendingOperations(USER_ID)).toBe(0);
  });

  it('calls addTask with userId and input for create operations', async () => {
    const input = { name: 'New task', isDaily: false };
    mockGetAll.mockResolvedValue([
      { id: 'op-1', type: 'create', taskId: 'temp-1', input, createdAt: 1 },
    ]);
    mockAddTask.mockResolvedValue(ok({ id: 'real-1', name: 'New task', isDaily: false, completed: false }));

    const count = await syncPendingOperations(USER_ID);

    expect(mockAddTask).toHaveBeenCalledWith(USER_ID, input);
    expect(mockRemove).toHaveBeenCalledWith('op-1');
    expect(count).toBe(1);
  });

  it('calls completeTask with the taskId for complete operations', async () => {
    mockGetAll.mockResolvedValue([
      { id: 'op-1', type: 'complete', taskId: 'real-uuid', createdAt: 1 },
    ]);
    mockCompleteTask.mockResolvedValue(ok({ id: 'real-uuid', completed: true }));

    const count = await syncPendingOperations(USER_ID);

    expect(mockCompleteTask).toHaveBeenCalledWith('real-uuid');
    expect(count).toBe(1);
  });

  it('calls updateTask with the taskId and input for update operations', async () => {
    const input = { name: 'Updated', isDaily: true };
    mockGetAll.mockResolvedValue([
      { id: 'op-1', type: 'update', taskId: 'real-uuid', input, createdAt: 1 },
    ]);
    mockUpdateTask.mockResolvedValue(ok({ id: 'real-uuid', name: 'Updated' }));

    const count = await syncPendingOperations(USER_ID);

    expect(mockUpdateTask).toHaveBeenCalledWith('real-uuid', input);
    expect(count).toBe(1);
  });

  it('calls deleteTask with the taskId for delete operations', async () => {
    mockGetAll.mockResolvedValue([
      { id: 'op-1', type: 'delete', taskId: 'real-uuid', createdAt: 1 },
    ]);
    mockDeleteTask.mockResolvedValue(ok(null));

    const count = await syncPendingOperations(USER_ID);

    expect(mockDeleteTask).toHaveBeenCalledWith('real-uuid');
    expect(count).toBe(1);
  });

  it('resolves a tempId for subsequent operations on the same task', async () => {
    const input = { name: 'Offline task', isDaily: false };
    mockGetAll.mockResolvedValue([
      { id: 'op-1', type: 'create', taskId: 'temp-abc', input, createdAt: 1 },
      { id: 'op-2', type: 'complete', taskId: 'temp-abc', createdAt: 2 },
      { id: 'op-3', type: 'update', taskId: 'temp-abc', input: { name: 'Renamed', isDaily: false }, createdAt: 3 },
      { id: 'op-4', type: 'delete', taskId: 'temp-abc', createdAt: 4 },
    ]);
    mockAddTask.mockResolvedValue(ok({ id: 'real-xyz', name: 'Offline task', isDaily: false, completed: false }));
    mockCompleteTask.mockResolvedValue(ok({ id: 'real-xyz', completed: true }));
    mockUpdateTask.mockResolvedValue(ok({ id: 'real-xyz', name: 'Renamed' }));
    mockDeleteTask.mockResolvedValue(ok(null));

    await syncPendingOperations(USER_ID);

    expect(mockCompleteTask).toHaveBeenCalledWith('real-xyz');
    expect(mockUpdateTask).toHaveBeenCalledWith('real-xyz', expect.any(Object));
    expect(mockDeleteTask).toHaveBeenCalledWith('real-xyz');
  });

  it('stops processing on the first failed operation', async () => {
    const input = { name: 'Task', isDaily: false };
    mockGetAll.mockResolvedValue([
      { id: 'op-1', type: 'create', taskId: 'temp-1', input, createdAt: 1 },
      { id: 'op-2', type: 'complete', taskId: 'real-2', createdAt: 2 },
    ]);
    mockAddTask.mockResolvedValue(fail());

    const count = await syncPendingOperations(USER_ID);

    expect(mockCompleteTask).not.toHaveBeenCalled();
    expect(count).toBe(0);
  });

  it('does not remove a failed operation from the queue', async () => {
    const input = { name: 'Task', isDaily: false };
    mockGetAll.mockResolvedValue([
      { id: 'op-1', type: 'create', taskId: 'temp-1', input, createdAt: 1 },
    ]);
    mockAddTask.mockResolvedValue(fail());

    await syncPendingOperations(USER_ID);

    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('returns the count of successfully synced operations', async () => {
    const input = { name: 'Task', isDaily: false };
    mockGetAll.mockResolvedValue([
      { id: 'op-1', type: 'create', taskId: 'temp-1', input, createdAt: 1 },
      { id: 'op-2', type: 'delete', taskId: 'real-2', createdAt: 2 },
    ]);
    mockAddTask.mockResolvedValue(ok({ id: 'real-1', name: 'Task', isDaily: false, completed: false }));
    mockDeleteTask.mockResolvedValue(ok(null));

    const count = await syncPendingOperations(USER_ID);

    expect(count).toBe(2);
  });
});
