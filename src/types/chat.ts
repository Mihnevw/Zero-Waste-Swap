import { User } from './user';

export interface Message {
  _id: string;
  chat: string;
  sender: User;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Chat {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
} 