import cron from 'node-cron';
import { getExpiredAgentUserIds } from '../api/v1/agents/service';
import { updateAgentCredit } from '../api/v1/credits/service';
import { moveExpiredPosts } from '../api/v1/posts/service';
import { updateBulkIsUserAnAgent } from '../api/v1/users/service';
import logger from './logger';

async function scheduledTask() {
  try {
    logger.info('Running cron job');
    const ids = await getExpiredAgentUserIds();
    await updateBulkIsUserAnAgent(ids, false);
    await updateAgentCredit(ids, 0);
    await moveExpiredPosts();
  } catch (error) {
    logger.error(error.message);
  }
}

const cronJob = cron.schedule('* * * * *', scheduledTask); // TODO: add { timezone: 'UTC' }

cronJob.on('error', (err) => {
  logger.info('Cron job error:', err.message);
});

// // Stop the cron job when the application is shutting down
// process.on('SIGINT', () => {
//   logger.info('Stopping cron job...');
//   job.stop();
//   process.exit();
// });

export default cronJob;
