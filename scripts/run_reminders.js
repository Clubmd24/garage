import { startReminderScheduler } from '../services/reminderScheduler.js';

startReminderScheduler();

// keep process running
setInterval(() => {}, 1 << 30);
