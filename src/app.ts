import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import morganMiddleware from './middlewares/MorganMiddleware';
import logger from './utils/logger';
import config from './config';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    // @ts-ignore
    origin: config.clientOrigins[config.nodeEnv],
  })
);
app.use(helmet());
app.use(morganMiddleware);

app.get('/', (req: Request, res: Response) => {
	logger.info('Checking the API status: Everything is OK');
  res.send('Express + TypeScript Server');
});

export default app;
