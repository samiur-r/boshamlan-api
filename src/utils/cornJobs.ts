import cron from 'node-cron';
import { fireAgentExpirationAlert, getExpiredAgentUserIds } from '../api/v1/agents/service';
import { updateAgentCredit } from '../api/v1/credits/service';
import { moveExpiredPosts } from '../api/v1/posts/service';
import { findUnVerifiedUsers, updateBulkIsUserAnAgent } from '../api/v1/users/service';
import logger from './logger';
import { alertOnSlack } from './slackUtils';

async function scheduledTaskPerHour() {
  try {
    logger.info('Running hourly cron job');
    const ids = await getExpiredAgentUserIds();
    await updateBulkIsUserAnAgent(ids, false);
    await updateAgentCredit(ids, 0);
    await fireAgentExpirationAlert(ids);
    await moveExpiredPosts();
  } catch (error) {
    logger.error(error.message);
  }
}

async function scheduledTaskPerFiveMins() {
  try {
    logger.info('Running per 5 mins cron job');
    const users = await findUnVerifiedUsers();

    let slackMsg = `Unverified users: `;

    users.forEach((user) => {
      slackMsg = `${slackMsg} \n\n ${user?.phone ? `User: <https://wa.me/965${user?.phone}|${user?.phone}>` : ''}`;
    });
    if (users && users.length) await alertOnSlack('imp', slackMsg);
  } catch (error) {
    logger.error(error.message);
  }
}

const cronJobPerHour = cron.schedule('0 * * * *', scheduledTaskPerHour);
const cronJobPerFiveMins = cron.schedule('*/5 * * * *', scheduledTaskPerFiveMins);

cronJobPerHour.on('error', (err) => {
  logger.info('Cron job error:', err.message);
});

cronJobPerFiveMins.on('error', (err) => {
  logger.info('Cron job error:', err.message);
});

// // Stop the cron job when the application is shutting down
// process.on('SIGINT', () => {
//   logger.info('Stopping cron job...');
//   job.stop();
//   process.exit();
// });

export { cronJobPerHour, cronJobPerFiveMins };
