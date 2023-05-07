import axios from 'axios';
import config from '../config';
import logger from './logger';

const alertOnSlack = async (channel: string, msg: string) => {
  logger.info(`Alerting on slack: ${msg}`);
  const slackMsg = JSON.stringify({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `>${msg.replace(/\n/g, '\n>')}`,
        },
      },
      {
        type: 'divider',
      },
    ],
  });
  try {
    await axios({
      method: 'POST',
      url: channel === 'imp' ? config.slackWebHookImpUrl : config.slackWebHookNonImpUrl,
      data: slackMsg,
    });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
  }
};

export { alertOnSlack };
