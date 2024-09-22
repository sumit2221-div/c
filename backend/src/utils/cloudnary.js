import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.error('File does not exist:', localFilePath);
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    // Remove the locally saved temporary file
    fs.unlinkSync(localFilePath); 
    console.log('File uploaded to Cloudinary:', response.url);
    return response;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Clean up temporary file
    }
    return null;
  }
};

export { uploadOnCloudinary };
