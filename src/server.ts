import app from './app';
import config from './config';
import logger from './utils/logger';
import AppDataSource from './db';
import { cronJobPerHour, cronJobPerFiveMins } from './utils/cornJobs';
import { initializeSocketIO } from './utils/socketIO';

AppDataSource.initialize()
  .then(() => {
    logger.info('Connected to database');
    cronJobPerHour.start();
    cronJobPerFiveMins.start();
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Listening on ${config.port} with NODE_ENV=${config.nodeEnv} 🚀`);
    });
    // initializeSocketIO(server);
  })
  .catch((error) => logger.error(`Failed to connect to database ${error}`));
