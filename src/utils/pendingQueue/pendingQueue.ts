import AsyncStorage from '@react-native-async-storage/async-storage';
import { OperationType, PendingOperation, TaskInput } from '../../types/task';

const QUEUE_KEY = '@strikeItOff:pendingOperations';

export function generateTempId(): string {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function enqueue(
  type: OperationType,
  taskId: string,
  input?: TaskInput
): Promise<PendingOperation> {
  const op: PendingOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    taskId,
    input,
    createdAt: Date.now(),
  };
  const existing = await getAll();
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([...existing, op]));
  return op;
}

export async function getAll(): Promise<PendingOperation[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function remove(operationId: string): Promise<void> {
  const existing = await getAll();
  await AsyncStorage.setItem(
    QUEUE_KEY,
    JSON.stringify(existing.filter((op) => op.id !== operationId))
  );
}

export async function clear(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
