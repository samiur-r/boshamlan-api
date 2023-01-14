import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from '../api/v1/users/model';
import { Credit } from '../api/v1/credits/model';
import { Otp } from '../api/v1/otps/model';
import { Agent } from '../api/v1/agents/model';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'boshamlan_dev',
  synchronize: true,
  logging: false,
  entities: [User, Credit, Otp, Agent],
  //   cli: {
  //     entitiesDir: 'src/orm/entities',
  //     migrationsDir: 'src/orm/migrations',
  //     subscribersDir: 'src/orm/subscriber',
  //   },
});

export default AppDataSource;
