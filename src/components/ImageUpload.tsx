import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImageUrl?: string;
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (options: any, callback: (error: any, result: any) => void) => any;
    };
  }
}

const ImageUpload = ({ onUpload, currentImageUrl }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [widget, setWidget] = useState<any>(null);

  useEffect(() => {
    // Load Cloudinary script
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const uploadWidget = window.cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          sources: ['local', 'camera'],
          multiple: false,
          maxFileSize: 5000000, // 5MB
          resourceType: 'image',
        },
        (error: any, result: any) => {
          if (error) {
            console.error('Upload error:', error);
            return;
          }
          if (result.event === 'success') {
            onUpload(result.info.secure_url);
            setUploading(false);
          }
        }
      );
      setWidget(uploadWidget);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [onUpload]);

  const handleUpload = () => {
    if (widget) {
      setUploading(true);
      widget.open();
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {currentImageUrl && (
        <Box sx={{ mb: 2 }}>
          <img
            src={currentImageUrl}
            alt="Current"
            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
          />
        </Box>
      )}
      <Button
        variant="outlined"
        onClick={handleUpload}
        disabled={uploading || !widget}
        fullWidth
      >
        {uploading ? (
          <CircularProgress size={24} />
        ) : (
          'Upload Image'
        )}
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Supported formats: JPG, PNG, GIF (max 5MB)
      </Typography>
    </Box>
  );
};

export default ImageUpload; 