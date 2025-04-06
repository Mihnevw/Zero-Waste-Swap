export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  userName: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'available' | 'pending' | 'completed';
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  tags?: string[];
} 