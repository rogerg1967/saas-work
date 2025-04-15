const fs = require('fs');
const path = require('path');

/**
 * Converts an image file path to base64 format for API requests
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} Base64-encoded image data
 */
async function imageToBase64(imagePath) {
  try {
    // Check if the path is a URL (starts with http:// or https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // Extract the filename from the URL
      const urlParts = imagePath.split('/');
      const filename = urlParts[urlParts.length - 1];

      // Construct the local path to the file in the uploads directory
      const localPath = path.join(__dirname, '../..', 'uploads', filename);

      console.log("Image path is a URL. Extracted filename:", filename);
      console.log("Looking for file at local path:", localPath);

      // Check if file exists at the local path
      if (!fs.existsSync(localPath)) {
        console.error("Image file not found at local path:", localPath);
        throw new Error("Image file not found at local path: " + localPath);
      }

      // Read the file as a buffer
      const imageBuffer = await fs.promises.readFile(localPath);
      console.log("Successfully read image file from local path, size:", imageBuffer.length, "bytes");

      // Convert to base64
      const base64Image = imageBuffer.toString('base64');
      console.log("Successfully converted image to base64, length:", base64Image.length);

      return base64Image;
    } else {
      // Check if the path is already an absolute path
      const isAbsolutePath = path.isAbsolute(imagePath);

      // If it's already an absolute path, use it directly
      const absolutePath = isAbsolutePath
        ? imagePath
        : path.join(__dirname, '../..', 'uploads', path.basename(imagePath));

      console.log("Reading image from absolute path:", absolutePath);

      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        console.error("Image file not found at path:", absolutePath);
        throw new Error("Image file not found at path: " + absolutePath);
      }

      // Read the file as a buffer
      const imageBuffer = await fs.promises.readFile(absolutePath);
      console.log("Successfully read image file, size:", imageBuffer.length, "bytes");

      // Convert to base64
      const base64Image = imageBuffer.toString('base64');
      console.log("Successfully converted image to base64, length:", base64Image.length);

      return base64Image;
    }
  } catch (error) {
    console.error("Error converting image to base64:", error.message);
    throw error;
  }
}

/**
 * Gets the full URL for an image, either as a base64 data URI or a server URL
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} Full image URL
 */
async function getFullImageUrl(imagePath) {
  try {
    // For local files, convert to base64
    const base64Image = await imageToBase64(imagePath);
    return "data:image/jpeg;base64," + base64Image;
  } catch (error) {
    console.error("Error getting full image URL:", error.message);
    throw error;
  }
}

module.exports = {
  imageToBase64,
  getFullImageUrl
};