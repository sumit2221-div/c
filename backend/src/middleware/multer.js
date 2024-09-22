import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Define the directory path
const tempDir = path.join(__dirname, 'public/temp');

// Create the directory if it doesn't exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Create multer instance
export const upload = multer({ storage });
