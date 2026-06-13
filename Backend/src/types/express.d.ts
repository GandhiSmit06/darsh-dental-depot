import { Request } from 'express';
import { IUser } from '../interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface AuthRequest extends Request {
  user: IUser;
}
