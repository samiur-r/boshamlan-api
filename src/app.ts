import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';

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
app.use(morgan('tiny'));

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

export default app;
