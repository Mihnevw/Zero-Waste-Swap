export interface User {
  _id: string;
  username: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  online?: boolean;
  lastSeen?: string;
} 