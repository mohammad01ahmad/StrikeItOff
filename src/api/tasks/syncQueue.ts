import { addTask, completeTask, updateTask, deleteTask } from './tasks';
import { getAll, remove } from '../../utils/pendingQueue/pendingQueue';

export async function syncPendingOperations(userId: string): Promise<number> {
  const operations = await getAll();
  if (operations.length === 0) return 0;

  let synced = 0;
  // maps tempId → real Supabase ID for tasks created during this sync session
  const tempIdMap: Record<string, string> = {};

  for (const op of operations) {
    const resolvedId = tempIdMap[op.taskId] ?? op.taskId;

    try {
      if (op.type === 'create' && op.input) {
        const res = await addTask(userId, op.input);
        if (res.status !== 'success' || !res.data) break;
        tempIdMap[op.taskId] = res.data.id;
      } else if (op.type === 'complete') {
        const res = await completeTask(resolvedId);
        if (res.status !== 'success') break;
      } else if (op.type === 'update' && op.input) {
        const res = await updateTask(resolvedId, op.input);
        if (res.status !== 'success') break;
      } else if (op.type === 'delete') {
        const res = await deleteTask(resolvedId);
        if (res.status !== 'success') break;
      }

      await remove(op.id);
      synced++;
    } catch {
      break;
    }
  }

  return synced;
}
