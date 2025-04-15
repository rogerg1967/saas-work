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

// Combined file filter for both images and documents
const combinedFileFilter = function (req, file, cb) {
  // Accept both images and documents
  if (file.fieldname === 'image') {
    // For image field, only accept image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      console.error(`Rejected file: ${file.originalname} - not an image file`);
      return cb(new Error('Only image files are allowed for image field!'), false);
    }
    console.log(`Accepted image file: ${file.originalname}`);
    cb(null, true);
  } else if (file.fieldname === 'document') {
    // For document field, only accept document files
    if (!file.originalname.match(/\.(pdf|doc|docx|txt|rtf|odt|xls|xlsx|csv|ppt|pptx)$/i)) {
      console.error(`Rejected file: ${file.originalname} - not a supported document type`);
      return cb(new Error('Only document files (PDF, DOCX, TXT, etc.) are allowed for document field!'), false);
    }
    console.log(`Accepted document file: ${file.originalname}`);
    cb(null, true);
  } else {
    console.error(`Rejected file: ${file.originalname} - unknown field name: ${file.fieldname}`);
    return cb(new Error(`Unknown field name: ${file.fieldname}`), false);
  }
};

// Create a single multer instance that can handle both types of files
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: combinedFileFilter
});

// Middleware for handling single image uploads
const uploadSingleImage = upload.single('image');

// Middleware for handling single document uploads
const uploadSingleDocument = upload.single('document');

// Middleware that can handle either image or document uploads
const uploadFileMiddleware = (req, res, next) => {
  console.log('Processing file upload request');

  // Check if the request has Content-Type header that includes multipart/form-data
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
    console.log('Request does not contain multipart form data, skipping file processing');
    return next();
  }

  // Use a single multer instance with fields for both image and document
  const uploadAny = upload.any([
    { name: 'image', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]);

  uploadAny(req, res, (err) => {
    if (err) {
      console.error(`File upload error: ${err.message}`);
      return res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`
      });
    }

    // Process the files if they exist
    if (req.files && req.files.length > 0) {
      // Find the file (either image or document)
      const file = req.files[0];
      console.log(`Processed file: ${file.originalname}, fieldname: ${file.fieldname}`);

      // Store the file in req.file for compatibility with existing code
      req.file = file;
    } else {
      console.log('No files found in the request');
    }

    next();
  });
};

module.exports = {
  uploadSingleImage,
  uploadSingleDocument,
  uploadFileMiddleware
};