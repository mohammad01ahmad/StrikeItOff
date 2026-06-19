// Unit tests — pure normalizer; verifies trimming, optional fields, and defaults.
import { createTask } from './createTask';

describe('createTask', () => {
  it('builds a task input with required fields', () => {
    const input = createTask({ name: 'Buy groceries' });
    expect(input.name).toBe('Buy groceries');
    expect(input.isDaily).toBe(false);
  });

  it('trims whitespace from name', () => {
    const input = createTask({ name: '  Morning run  ' });
    expect(input.name).toBe('Morning run');
  });

  it('sets optional fields when provided', () => {
    const input = createTask({
      name: 'Stand-up',
      priority: 'high',
      isDaily: true,
      time: '9:00 AM',
    });
    expect(input.priority).toBe('high');
    expect(input.isDaily).toBe(true);
    expect(input.time).toBe('9:00 AM');
  });

  it('omits time when empty string is given', () => {
    const input = createTask({ name: 'Stand-up', time: '   ' });
    expect(input.time).toBeUndefined();
  });

  it('omits priority when not provided', () => {
    const input = createTask({ name: 'Read' });
    expect(input.priority).toBeUndefined();
  });
});
