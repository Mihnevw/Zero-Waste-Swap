import React, { useState, useRef } from 'react';
import { Box, Avatar, IconButton, CircularProgress } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';

const ProfilePhotoUpload: React.FC = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      // Create a reference to the file location in Firebase Storage
      const storageRef = ref(storage, `profile-photos/${user.uid}/${file.name}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update the user's profile with the new photo URL
      await updateProfile(user, {
        photoURL: downloadURL
      });

      // Force a reload of the user object to get the updated photo URL
      window.location.reload();
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        sx={{ width: 100, height: 100, mb: 2, cursor: 'pointer' }}
        alt={user?.displayName || 'User'}
        src={user?.photoURL || ''}
        onClick={handlePhotoClick}
      />
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <IconButton
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
        onClick={handlePhotoClick}
        disabled={uploading}
      >
        {uploading ? <CircularProgress size={24} color="inherit" /> : <PhotoCamera />}
      </IconButton>
    </Box>
  );
};

export default ProfilePhotoUpload; 