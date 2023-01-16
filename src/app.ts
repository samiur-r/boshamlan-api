import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import morganMiddleware from './middlewares/MorganMiddleware';
import config from './config';
import userRoutes from './api/v1/users';
import errorHandler from './middlewares/ErrorHandler';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    origin: config.clientOrigins[config.nodeEnv],
  }),
);
app.use(helmet());
app.use(morganMiddleware);

app.use('/api/v1/user', userRoutes);

app.use(errorHandler);

export default app;
