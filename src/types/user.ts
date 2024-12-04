import { Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  username: string;
  password: string;
}