const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      console.log(`Creating uploads directory: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    console.log(`Storing file as: ${uniqueFilename}`);
    cb(null, uniqueFilename);
  }
});

// File filter function to allow only certain file types
const fileFilter = (req, file, cb) => {
  // Allowed mime types
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log(`Accepted file of type: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.log(`Rejected file of type: ${file.mimetype}`);
    cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer instances
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware for single image upload
const uploadSingleImage = upload.single('image');

// Middleware for single document upload
const uploadSingleDocument = upload.single('document');

// Middleware for any single file upload
const uploadSingleFile = upload.single('file');

// Create a middleware that can handle both image and document uploads
const uploadFileMiddleware = (req, res, next) => {
  console.log('Processing file upload request');

  // Check if the request has Content-Type header that includes multipart/form-data
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    console.log('Request does not contain multipart form data, skipping file processing');
    return next();
  }

  // Determine which field to use based on the request
  const processUpload = (err) => {
    if (err) {
      // If there was an error with image upload, try document upload
      console.log('Image field not found, trying document field');
      uploadSingleDocument(req, res, (err) => {
        if (err) {
          console.log(`Document upload error: ${err.message}`);
          return res.status(400).json({
            success: false,
            error: `File upload error: ${err.message}`
          });
        }
        next();
      });
    } else {
      // If image upload succeeded, continue
      console.log('Image uploaded successfully');
      next();
    }
  };

  // Try image upload first
  console.log('Attempting to process as image upload');
  uploadSingleImage(req, res, processUpload);
};

module.exports = {
  uploadSingleImage,
  uploadSingleDocument,
  uploadSingleFile,
  uploadFileMiddleware
};