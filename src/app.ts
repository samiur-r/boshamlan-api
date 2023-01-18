import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import morganMiddleware from './middlewares/MorganMiddleware';
import userRoutes from './api/v1/users';
import errorHandler from './middlewares/ErrorHandler';
import corsOptions from './config/corsOption';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());
app.use(morganMiddleware);

app.use('/api/v1/user', userRoutes);

app.use(errorHandler);

export default app;
