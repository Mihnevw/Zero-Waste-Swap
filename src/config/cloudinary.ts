import { Cloudinary } from '@cloudinary/url-gen';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

if (!cloudName) {
  throw new Error('Cloudinary cloud name is not defined in environment variables');
}

export const cld = new Cloudinary({
  cloud: {
    cloudName,
  },
}); 