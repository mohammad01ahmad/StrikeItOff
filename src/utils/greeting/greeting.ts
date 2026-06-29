/**
 * Formats a date exactly into: "Weekday, Month Day" (e.g., "Monday, Jun 22")
 * Automatically respects the mobile device's regional locale settings!
 */
export function formatToday(date: Date = new Date()): string {
  // Using 'default' safely inherits the phone's native system language/locale
  const weekday = new Intl.DateTimeFormat('default', { weekday: 'long' }).format(date);
  const month = new Intl.DateTimeFormat('default', { month: 'short' }).format(date);
  const day = date.getDate();

  return `${weekday}, ${month} ${day}`;
}

const MORNING_GREETINGS = ['Good morning', 'Rise and shine', 'Morning'];
const AFTERNOON_GREETINGS = ["What's next", 'Good afternoon', 'Keep the focus'];
const EVENING_GREETINGS = ['Good evening', "Let's wrap up", "What's next"];
const NIGHT_GREETINGS = ['Burning the midnight oil?', 'Rest well soon', 'Night owl'];

/**
 * Get greeting based on time of day with a fallback for late-night hours.
 * Uses a stable rotation algorithm based on the day of the month.
 */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  let pool: string[];

  if (hour >= 5 && hour < 12) {
    pool = MORNING_GREETINGS;
  } else if (hour >= 12 && hour < 17) {
    pool = AFTERNOON_GREETINGS;
  } else if (hour >= 17 && hour < 22) {
    pool = EVENING_GREETINGS;
  } else {
    // Covers 10:00 PM to 4:59 AM safely
    pool = NIGHT_GREETINGS;
  }

  // Your brilliant modulo trick remains intact!
  return pool[date.getDate() % pool.length];
}