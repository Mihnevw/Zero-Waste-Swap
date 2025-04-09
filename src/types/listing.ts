export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  status: string;
  images: string[];
  location: any;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  firstName?: string;
  lastName?: string;
  userListingsCount?: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | string;
  updatedAt: string;
} 