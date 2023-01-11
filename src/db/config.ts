import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'boshamlan_dev',
  synchronize: false,
  logging: false,
  entities: ['src/orm/entities/**/*.ts'],
  migrations: ['src/orm/migrations/**/*.ts'],
  subscribers: ['src/orm/subscriber/**/*.ts'],
  //   cli: {
  //     entitiesDir: 'src/orm/entities',
  //     migrationsDir: 'src/orm/migrations',
  //     subscribersDir: 'src/orm/subscriber',
  //   },
});

export default AppDataSource;
