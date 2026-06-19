const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// format date to Weekday, Month Day
export function formatToday(date: Date = new Date()): string {
  const weekday = WEEKDAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`;
}

const MORNING_GREETINGS = ['Good morning', 'Rise and shine', 'Morning'];
const AFTERNOON_GREETINGS = ["What's next", 'Good afternoon', 'Keep the focus'];
const EVENING_GREETINGS = ['Good evening', "Let's wrap up", "What's next"];

// Get greeting based on time of day
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  let pool: string[];
  if (hour >= 5 && hour < 12) {
    pool = MORNING_GREETINGS;
  } else if (hour >= 12 && hour < 17) {
    pool = AFTERNOON_GREETINGS;
  } else {
    pool = EVENING_GREETINGS;
  }
  // Rotate through alternates based on day-of-month so it varies but is stable
  return pool[date.getDate() % pool.length];
}
