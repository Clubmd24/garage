import cron from 'node-cron';
import { scheduleDueReminders } from './followUpRemindersService.js';

export function startReminderScheduler() {
  cron.schedule('0 3 * * *', async () => {
    try {
      await scheduleDueReminders();
    } catch (err) {
      console.error('REMINDER_JOB_ERROR:', err);
    }
  });
}

