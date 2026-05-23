import { DataSourceOptions } from 'typeorm';
import path from 'path';

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'payroll_dev',
  entities: [path.join(__dirname, 'src/database/entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, 'src/database/migrations/**/*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  dropSchema: false,
};

export default typeormConfig;
