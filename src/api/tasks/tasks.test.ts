// Unit tests for rowToTask — the only place the daily-reset logic lives.
// We inject `now` so tests don't depend on the real clock.
import { rowToTask } from './tasks';
jest.mock('../../../lib/supabase', () => ({ supabase: {} }));

const BASE_ROW = {
  id: 'abc-123',
  user_id: 'user-1',
  name: 'Test task',
  priority: null as null | 'high' | 'medium' | 'low',
  is_daily: false,
  time: null as string | null,
  completed_at: null as string | null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const TODAY = new Date('2026-06-19T10:00:00');
const YESTERDAY = new Date('2026-06-18T10:00:00');

describe('rowToTask', () => {
  describe('one-off tasks (is_daily = false)', () => {
    it('is not completed when completed_at is null', () => {
      const task = rowToTask({ ...BASE_ROW, completed_at: null }, TODAY);
      expect(task.completed).toBe(false);
    });

    it('is completed when completed_at is set, regardless of date', () => {
      const task = rowToTask({ ...BASE_ROW, completed_at: YESTERDAY.toISOString() }, TODAY);
      expect(task.completed).toBe(true);
    });
  });

  describe('daily tasks (is_daily = true)', () => {
    it('is not completed when completed_at is null', () => {
      const task = rowToTask({ ...BASE_ROW, is_daily: true, completed_at: null }, TODAY);
      expect(task.completed).toBe(false);
    });

    it('is completed when completed_at is today', () => {
      // completed earlier same day
      const completedAt = new Date('2026-06-19T08:00:00');
      const task = rowToTask(
        { ...BASE_ROW, is_daily: true, completed_at: completedAt.toISOString() },
        TODAY
      );
      expect(task.completed).toBe(true);
    });

    it('resets to not completed when completed_at was yesterday', () => {
      const task = rowToTask(
        { ...BASE_ROW, is_daily: true, completed_at: YESTERDAY.toISOString() },
        TODAY
      );
      expect(task.completed).toBe(false);
    });
  });

  describe('field mapping', () => {
    it('maps all fields correctly', () => {
      const row = {
        ...BASE_ROW,
        name: '  Stand-up  ',
        priority: 'high' as const,
        is_daily: true,
        time: '9:00 AM',
      };
      const task = rowToTask(row, TODAY);
      expect(task.id).toBe('abc-123');
      expect(task.name).toBe('Stand-up');
      expect(task.priority).toBe('high');
      expect(task.isDaily).toBe(true);
      expect(task.time).toBe('9:00 AM');
    });

    it('omits priority when null', () => {
      const task = rowToTask({ ...BASE_ROW, priority: null }, TODAY);
      expect(task.priority).toBeUndefined();
    });

    it('omits time when null', () => {
      const task = rowToTask({ ...BASE_ROW, time: null }, TODAY);
      expect(task.time).toBeUndefined();
    });
  });
});
