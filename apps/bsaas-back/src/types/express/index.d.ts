import { UserRole } from '../../modules/appointment/types/appointment.types';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      [key: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
