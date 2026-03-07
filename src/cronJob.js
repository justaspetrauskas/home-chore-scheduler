import 'dotenv/config'
import { randomizeChoreAssignments } from './controllers/services/assignmentService.js';

// Example: fetch jobs from DB or define logic to determine if a job should run
async function main() {
  // Replace with your logic to determine if a job should run
  const eventId = /* fetch or define eventId */
  const userIds = /* fetch or define userIds */
  const choreIds = /* fetch or define choreIds */

  if (eventId && userIds && choreIds) {
    try {
      await randomizeChoreAssignments(userIds, choreIds, eventId);
      console.log('Chore assignments randomized.');
    } catch (err) {
      console.error('Error running assignment job:', err);
    }
  } else {
    console.log('No job to run.');
  }
}

main();
