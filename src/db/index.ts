import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from '../api/v1/users/model';
import { Credit } from '../api/v1/credits/model';
import { Otp } from '../api/v1/otps/model';
import { Agent } from '../api/v1/agents/model';
import { Transaction } from '../api/v1/transactions/model';
import { Package } from '../api/v1/packages/model';
import { Category } from '../api/v1/categories/model';
import { PropertyType } from '../api/v1/property_types/model';
import { Location } from '../api/v1/locations/model';
import { Post } from '../api/v1/posts/models/Post';
import { ArchivePost } from '../api/v1/posts/models/ArchivePost';
import { DeletedPost } from '../api/v1/posts/models/DeletedPost';
import { TempPost } from '../api/v1/posts/models/TempPost';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'boshamlan_dev',
  synchronize: true,
  logging: false,
  migrationsRun: false,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [
    User,
    Credit,
    Otp,
    Agent,
    Transaction,
    Package,
    Category,
    PropertyType,
    Location,
    Post,
    ArchivePost,
    DeletedPost,
    TempPost,
  ],
});

export default AppDataSource;
