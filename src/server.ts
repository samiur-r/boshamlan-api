import app from './app';
import config from './config';
import logger from './utils/logger';

app.listen(config.port, () => {
  logger.info(`🚀 Listening n ${config.port} with NODE_ENV=${config.nodeEnv} 🚀`);
});
