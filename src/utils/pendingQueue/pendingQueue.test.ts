import AsyncStorage from '@react-native-async-storage/async-storage';
import { enqueue, getAll, remove, clear, generateTempId } from './pendingQueue';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

const CREATE_INPUT = { name: 'Buy milk', isDaily: false };

describe('generateTempId', () => {
  it('returns a string starting with "pending-"', () => {
    expect(generateTempId()).toMatch(/^pending-/);
  });

  it('generates unique IDs on each call', () => {
    expect(generateTempId()).not.toBe(generateTempId());
  });
});

describe('enqueue', () => {
  it('returns an operation with correct type and taskId', async () => {
    const op = await enqueue('create', 'temp-1', CREATE_INPUT);
    expect(op.type).toBe('create');
    expect(op.taskId).toBe('temp-1');
    expect(op.input).toEqual(CREATE_INPUT);
  });

  it('assigns a unique string id and numeric timestamp', async () => {
    const op = await enqueue('create', 'temp-1', CREATE_INPUT);
    expect(typeof op.id).toBe('string');
    expect(typeof op.createdAt).toBe('number');
  });

  it('stores undefined input for complete and delete operations', async () => {
    const complete = await enqueue('complete', 'real-uuid');
    const del = await enqueue('delete', 'real-uuid-2');
    expect(complete.input).toBeUndefined();
    expect(del.input).toBeUndefined();
  });

  it('persists multiple operations across separate enqueue calls', async () => {
    await enqueue('create', 'temp-1', CREATE_INPUT);
    await enqueue('complete', 'real-2');
    const all = await getAll();
    expect(all).toHaveLength(2);
  });

  it('preserves insertion order', async () => {
    await enqueue('create', 'temp-1', CREATE_INPUT);
    await enqueue('delete', 'real-2');
    const all = await getAll();
    expect(all[0].type).toBe('create');
    expect(all[1].type).toBe('delete');
  });
});

describe('getAll', () => {
  it('returns an empty array when the queue is empty', async () => {
    expect(await getAll()).toEqual([]);
  });

  it('returns all operations in insertion order', async () => {
    const op1 = await enqueue('create', 'temp-1', CREATE_INPUT);
    const op2 = await enqueue('update', 'real-2', { name: 'Updated', isDaily: true });
    const all = await getAll();
    expect(all[0].id).toBe(op1.id);
    expect(all[1].id).toBe(op2.id);
  });
});

describe('remove', () => {
  it('removes only the operation with the given id', async () => {
    const op1 = await enqueue('create', 'temp-1', CREATE_INPUT);
    const op2 = await enqueue('complete', 'real-2');
    await remove(op1.id);
    const remaining = await getAll();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(op2.id);
  });

  it('is a no-op when the id is not found', async () => {
    await enqueue('create', 'temp-1', CREATE_INPUT);
    await remove('nonexistent-id');
    expect(await getAll()).toHaveLength(1);
  });
});

describe('clear', () => {
  it('empties the queue', async () => {
    await enqueue('create', 'temp-1', CREATE_INPUT);
    await clear();
    expect(await getAll()).toEqual([]);
  });

  it('is a no-op when the queue is already empty', async () => {
    await clear();
    expect(await getAll()).toEqual([]);
  });
});
