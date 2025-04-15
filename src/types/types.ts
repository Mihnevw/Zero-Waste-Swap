import { User } from './user';

// Base message interface
export interface BaseMessage {
  _id: string;
  text: string;
  createdAt: string | Date;
  read: boolean;
}

// Base chat interface
export interface BaseChat {
  _id: string;
  participants: User[];
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Full message interface
export interface Message extends BaseMessage {
  chat: string | BaseChat;  // ObjectId as string when not populated, Chat when populated
  sender: string | User;  // ObjectId as string when not populated, User when populated
}

// Full chat interface
export interface Chat extends BaseChat {
  messages?: Message[];
  lastMessage?: Message;
}

// Helper types
export type NewMessage = Omit<Message, '_id' | 'createdAt'> & {
  createdAt?: Date;
};

export type PopulatedMessage = Omit<Message, 'chat' | 'sender'> & {
  chat: BaseChat;
  sender: User;
}; 