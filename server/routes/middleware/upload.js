const multer = require('multer');

// Configure storage
const storage = multer.memoryStorage();

// File filter function to check file types
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure upload limits
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB limit
  files: 1 // Maximum 1 file
};

// Create upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = {
  uploadSingleImage: upload.single('image')
};