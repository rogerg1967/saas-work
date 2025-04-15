const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsDir}`);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`Setting destination to: ${uploadsDir}`);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with the original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = uniqueSuffix + extension;
    console.log(`Generated filename for '${file.originalname}': ${filename}`);
    cb(null, filename);
  }
});

// Create the multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      console.error(`Rejected file: ${file.originalname} - not an image file`);
      return cb(new Error('Only image files are allowed!'), false);
    }
    console.log(`Accepted file: ${file.originalname}`);
    cb(null, true);
  }
});

// Middleware for handling single image uploads
const uploadSingleImage = upload.single('image');

module.exports = {
  uploadSingleImage
};