import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import CookieParser from 'cookie-parser';

import morganMiddleware from './middlewares/MorganMiddleware';
import errorHandlingMiddleware from './middlewares/ErrorHandlingMiddleware';
import corsOptions from './config/corsOption';
import config from './config';

import userRoutes from './api/v1/users';
import otpRoutes from './api/v1/otps';
import transactionRoutes from './api/v1/transactions';
import agentRoutes from './api/v1/agents';
import postRoutes from './api/v1/posts';
import creditRoutes from './api/v1/credits';
import accountRoutes from './api/v1/account';

const app: Express = express();

app.use(CookieParser(config.cookieSecret));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());
app.use(morganMiddleware);

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/otp', otpRoutes);
app.use('/api/v1/transaction', transactionRoutes);
app.use('/api/v1/agent', agentRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/credits', creditRoutes);
app.use('/api/v1/account', accountRoutes);

app.use(errorHandlingMiddleware);

export default app;
