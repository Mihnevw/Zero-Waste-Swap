# Zero-Waste Swap Platform

A modern web application for exchanging items (clothes, equipment, books, etc.) with a focus on sustainability and zero-waste principles.

## Features

- 🔐 User Authentication with Firebase
- 📸 Image Upload with Cloudinary
- 🔍 Advanced Search and Filtering with Fuse.js
- 🗺 Interactive Map with React Leaflet
- 👤 User Profiles and Listings Management
- 🎨 Modern UI with Material-UI

## Tech Stack

- React with TypeScript
- Firebase Authentication
- Cloudinary for Image Management
- Fuse.js for Search/Filter
- React Leaflet for Maps
- Material-UI for Components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API and external service integrations
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── assets/        # Static assets (images, icons)
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
