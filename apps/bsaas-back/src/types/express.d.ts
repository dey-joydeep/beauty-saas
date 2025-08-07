import 'express-serve-static-core';
import { AuthenticatedUser } from '../common/middleware/auth';

// This type is used to make the user property compatible with both our AuthenticatedUser and the default User type
type RequestUser = AuthenticatedUser | Express.User | undefined;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      JWT_SECRET: string;
      TEST_JWT?: string;
      BASE_IMAGE_PATH?: string;
      PORTFOLIO_IMAGE_PATH?: string;
      CORS_ORIGIN?: string;
      API_PREFIX?: string;
      FRONTEND_URL?: string;
      DEBUG?: string;
      [key: string]: string | undefined;
    }
  }

  namespace Express {
    interface Request {
      language?: string;
      user?: RequestUser;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request extends Express.Request {}
}

// Export the extended types for use in the application
export * from 'express-serve-static-core';
