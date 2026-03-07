
import { run } from 'graphile-worker';
import 'dotenv/config'
import { randomizeChoreAssignments } from './controllers/services/assignmentService.js';

const taskList = {
  randomizeAssignments: async (payload) => {
    const { eventId, userIds, choreIds } = payload;
    try {
      // Use the shared service logic
      const result = await randomizeChoreAssignments(userIds, choreIds, eventId);
      if (!result.success) {
        console.error('Assignment generation failed:', result.error);
      } else {
        console.log(`Assignments created for event ${eventId}`);
      }
    } catch (error) {
      console.error('Error in randomizeAssignments:', error);
    }
  },
};

const runWorker = async () => {
  console.log('Worker started');
  await run({
    connectionString: process.env.DATABASE_URL,
    taskList,
    concurrency: 5,
    noHandleSignals: false,
  });
};

runWorker().catch(console.error);