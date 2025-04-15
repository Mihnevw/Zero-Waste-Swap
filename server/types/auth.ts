import { Request } from 'express';

export interface AuthUser {
  _id: string;
  uid: string;
  email: string;
  name: string;
  displayName: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
} 