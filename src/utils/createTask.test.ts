// Unit tests — pure factory function; verifies field defaults, trimming, optional fields, and ID uniqueness.
import { createTask } from './createTask';

describe('createTask', () => {
    it('builds a task with required fields', () => {
        const task = createTask({ name: 'Buy groceries' });
        expect(task.name).toBe('Buy groceries');
        expect(task.completed).toBe(false);
        expect(task.isDaily).toBe(false);
        expect(typeof task.id).toBe('string');
        expect(task.id.length).toBeGreaterThan(0);
    });

    it('trims whitespace from name', () => {
        const task = createTask({ name: '  Morning run  ' });
        expect(task.name).toBe('Morning run');
    });

    it('sets optional fields when provided', () => {
        const task = createTask({ name: 'Stand-up', priority: 'high', isDaily: true, time: '9:00 AM' });
        expect(task.priority).toBe('high');
        expect(task.isDaily).toBe(true);
        expect(task.time).toBe('9:00 AM');
    });

    it('omits time when empty string is given', () => {
        const task = createTask({ name: 'Stand-up', time: '   ' });
        expect(task.time).toBeUndefined();
    });

    it('omits priority when not provided', () => {
        const task = createTask({ name: 'Read' });
        expect(task.priority).toBeUndefined();
    });

    it('generates unique ids for different tasks', () => {
        const a = createTask({ name: 'Task A' });
        const b = createTask({ name: 'Task B' });
        expect(a.id).not.toBe(b.id);
    });
});
