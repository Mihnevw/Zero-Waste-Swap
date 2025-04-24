export interface User {
  _id: string;
  uid: string;
  username: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  online?: boolean;
  lastSeen?: string;
} 