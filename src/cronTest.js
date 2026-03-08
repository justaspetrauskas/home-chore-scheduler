import cron from 'node-cron';
import 'dotenv/config';

const schedule = process.env.CRON_SCHEDULE || '* * * * *'; // Default to running every minute if not set
cron.schedule(schedule, () => {
  console.log('Cron job running at', new Date().toLocaleString());
  // You can run any command or function here
});