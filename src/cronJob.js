import 'dotenv/config';
import { randomizeChoreAssignments } from './controllers/services/assignmentService.js';

// Helper: read a comma-separated list from an environment variable and return an array
function getEnvList(name) {
  const value = process.env[name];
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

// Example: fetch jobs from DB or define logic to determine if a job should run
async function main() {
  // Determine job parameters from environment variables
  const eventId = process.env.EVENT_ID;
  const userIds = getEnvList('USER_IDS');
  const choreIds = getEnvList('CHORE_IDS');

  if (eventId && userIds.length > 0 && choreIds.length > 0) {
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