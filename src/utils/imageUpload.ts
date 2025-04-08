import { cld } from '../config/cloudinary';

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'zero_waste_swap');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cld.cloudinaryConfig.cloud.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Грешка при качване на изображението');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Грешка при качване на изображението');
  }
}; 