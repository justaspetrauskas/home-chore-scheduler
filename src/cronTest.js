import cron from 'node-cron';
import 'dotenv/config';
import { connectDB, disconnectDB, prisma } from './config/db.js';

const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';
const runOnStartup = process.env.RUN_SCHEDULER_ON_STARTUP !== 'false';

const getDayBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const isWithinBounds = (value, start, end) => value >= start && value < end;

export const runDailyCleaningEventCheck = async (runDate = new Date()) => {
  const { start, end } = getDayBounds(runDate);
  const localRunDate = start.toLocaleDateString('en-CA');
  console.log(`[Scheduler] Running daily cleaning-event check for ${localRunDate}`);

  const events = await prisma.cleaningEvent.findMany({
    where: {
      OR: [
        { notificationDate: { gte: start, lt: end } },
        { eventDate: { gte: start, lt: end } },
      ],
    },
    select: {
      id: true,
      name: true,
      householdId: true,
      notificationDate: true,
      eventDate: true,
      status: true,
    },
    orderBy: { eventDate: 'asc' },
  });

  if (events.length === 0) {
    console.log('[Scheduler] No cleaning events matched today.');
    return;
  }

  for (const event of events) {
    const notificationMatches = isWithinBounds(event.notificationDate, start, end);
    const eventDateMatches = isWithinBounds(event.eventDate, start, end);

    if (notificationMatches) {
      console.log(
        `[Scheduler][notificationDate] Match for event ${event.id} (${event.name}) in household ${event.householdId}.`,
      );
    }

    if (eventDateMatches) {
      console.log(
        `[Scheduler][eventDate] Match for event ${event.id} (${event.name}) in household ${event.householdId}.`,
      );
    }
  }
};

const startScheduler = async () => {
  await connectDB();

  if (runOnStartup) {
    await runDailyCleaningEventCheck();
  }

  cron.schedule(schedule, async () => {
    try {
      await runDailyCleaningEventCheck();
    } catch (error) {
      console.error('[Scheduler] Error while checking cleaning events:', error);
    }
  });

  console.log(`[Scheduler] Scheduled with CRON expression: ${schedule}`);
};

startScheduler().catch(async (error) => {
  console.error('[Scheduler] Fatal startup error:', error);
  await disconnectDB();
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('[Scheduler] SIGINT received, shutting down.');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[Scheduler] SIGTERM received, shutting down.');
  await disconnectDB();
  process.exit(0);
});