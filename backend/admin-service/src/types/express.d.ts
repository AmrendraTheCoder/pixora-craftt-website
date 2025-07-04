import { DataSource } from 'typeorm';

declare global {
  namespace Express {
    interface Request {
      database?: DataSource;
    }
  }
}

export {}; 