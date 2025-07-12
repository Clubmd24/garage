import cron from 'node-cron';
import { scheduleDueReminders } from './followUpRemindersService.js';
import logger from '../lib/logger.js';

export function startReminderScheduler() {
  cron.schedule('0 3 * * *', async () => {
    try {
      await scheduleDueReminders();
    } catch (err) {
      logger.error({ err, msg: 'REMINDER_JOB_ERROR' });
    }
  });
}

