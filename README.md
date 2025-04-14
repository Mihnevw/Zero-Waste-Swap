# Zero-Waste Swap Platform

A modern web application for exchanging items (clothes, equipment, books, etc.) with a focus on sustainability and zero-waste principles.

## Features

- 🔐 User Authentication with Firebase
- 📸 Image Upload with Cloudinary
- 🔍 Advanced Search and Filtering with Fuse.js
- 🗺 Interactive Map with React Leaflet
- 👤 User Profiles and Listings Management
- 🎨 Modern UI with Material-UI
- 💬 Real-time Chat System

### Chat Features
- Real-time messaging between users
- Unread message notifications
- Message history and chat list
- User online/offline status
- Message read receipts

## Tech Stack

- React with TypeScript
- Firebase Authentication
- Cloudinary for Image Management
- Fuse.js for Search/Filter
- React Leaflet for Maps
- Material-UI for Components
- Socket.IO for Real-time Communication
- MongoDB for Message Storage

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── chat/      # Chat-related components
│   ├── items/     # Item listing components
│   └── layout/    # Layout components
├── pages/         # Page components
├── services/      # API and external service integrations
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── assets/        # Static assets (images, icons)

server/
├── controllers/   # API controllers
├── models/        # Database models
├── routes/        # API routes
├── middleware/    # Custom middleware
└── socket/        # WebSocket handlers
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Firebase account
- Cloudinary account

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd zero-waste-swap
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
```

3. Create environment variables:
```bash
# Frontend (.env)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
VITE_API_URL=http://localhost:3001

# Backend (.env)
MONGODB_URI=your_mongodb_uri
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

4. Start the development servers:
```bash
# Start frontend (in root directory)
npm run dev

# Start backend (in server directory)
npm run dev
```

## Chat System Architecture

### Frontend Components
- `ChatList`: Displays all user conversations
- `ChatWindow`: Shows messages in the selected chat
- `ChatListItem`: Individual chat preview with unread count

### Backend Structure
- Socket.IO for real-time messaging
- MongoDB for message storage
- Firebase for user authentication

### Real-time Features
- Instant message delivery
- Typing indicators
- Online status updates
- Unread message counts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
