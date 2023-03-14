import app from './app';
import config from './config';
import logger from './utils/logger';
// import AppDataSource from './db';
// import cronJob from './utils/cornJobs';

app.listen(config.port, () => {
  logger.info(`🚀 Listening on ${config.port} with NODE_ENV=${config.nodeEnv} 🚀`);
});

// AppDataSource.initialize()
//   .then(() => {
//     logger.info('Connected to database');
//     cronJob.start();
//     app.listen(config.port, () => {
//       logger.info(`🚀 Listening on ${config.port} with NODE_ENV=${config.nodeEnv} 🚀`);
//     });
//   })
//   .catch((error) => logger.error(`Failed to connect to database ${error}`));
