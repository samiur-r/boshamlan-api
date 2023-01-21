import { Vonage } from '@vonage/server-sdk';

import config from './index';

// @ts-ignore
const vonage = new Vonage({
  apiKey: config.vonageApiKey,
  apiSecret: config.vonageApiSecret,
});

export default vonage;
