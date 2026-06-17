// Unit tests — pure functions with no dependencies or side effects; input/output only.
import { formatToday, getGreeting } from './greeting';

describe('formatToday', () => {
    it('returns a string in "Weekday, Mon DD" format', () => {
        // Wednesday, June 17 2026
        const date = new Date(2026, 5, 17); // month is 0-indexed
        expect(formatToday(date)).toBe('Wednesday, Jun 17');
    });

    it('uses the date it is given, not today', () => {
        const date = new Date(2026, 0, 1); // Thursday, Jan 1
        expect(formatToday(date)).toBe('Thursday, Jan 1');
    });

    it('zero-pads nothing — day is numeric not zero-padded', () => {
        const date = new Date(2026, 2, 5); // Thursday, Mar 5
        expect(formatToday(date)).toBe('Thursday, Mar 5');
    });
});

describe('getGreeting', () => {
    it('returns a morning phrase between 05:00 and 11:59', () => {
        const morning = new Date(2026, 5, 17, 8, 30);
        expect(getGreeting(morning)).toMatch(/morning/i);
    });

    it('returns an afternoon phrase between 12:00 and 16:59', () => {
        const afternoon = new Date(2026, 5, 17, 14, 0);
        expect(getGreeting(afternoon)).toMatch(/afternoon|next|focus/i);
    });

    it('returns an evening phrase at 17:00 or later', () => {
        const evening = new Date(2026, 5, 17, 19, 0);
        expect(getGreeting(evening)).toMatch(/evening|next|wrap/i);
    });

    it('returns a string (never null/undefined)', () => {
        for (let hour = 0; hour < 24; hour++) {
            const d = new Date(2026, 5, 17, hour, 0);
            expect(typeof getGreeting(d)).toBe('string');
            expect(getGreeting(d).length).toBeGreaterThan(0);
        }
    });
});
