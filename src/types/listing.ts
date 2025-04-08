export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  userName: string;
  userEmail: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'налично' | 'чакащо' | 'завършено';
  condition: 'ново' | 'като ново' | 'добро' | 'задоволително' | 'лошо';
  tags?: string[];
} 