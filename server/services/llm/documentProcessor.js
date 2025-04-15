const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * Extract text content from document files for analysis
 * @param {string} documentPath - Path to the document file
 * @returns {Promise<string>} Extracted text content
 */
async function extractDocumentContent(documentPath) {
  try {
    console.log("Extracting content from document:", documentPath);

    // Check if file exists
    if (!fs.existsSync(documentPath)) {
      console.error("Document file not found at path:", documentPath);
      return "[Document file not found: " + path.basename(documentPath) + "]";
    }

    // Get file extension to determine document type
    const ext = path.extname(documentPath).toLowerCase();
    console.log("Document type detected as:", ext);

    // For text files, read directly
    if (ext === '.txt') {
      console.log("Processing as text file");
      const content = await fs.promises.readFile(documentPath, 'utf8');
      console.log("Successfully extracted text content, length:", content.length, "characters");
      return content.slice(0, 5000); // Limit content length
    }

    // For PDF files, use pdf-parse
    if (ext === '.pdf') {
      console.log("Processing as PDF file");
      try {
        const dataBuffer = await fs.promises.readFile(documentPath);
        const pdfData = await pdfParse(dataBuffer);
        const content = pdfData.text || "";
        console.log("Successfully extracted PDF content, length:", content.length, "characters");
        return content.slice(0, 5000); // Limit content length
      } catch (pdfError) {
        console.error("Error parsing PDF:", pdfError.message);
        return "[Error parsing PDF: " + pdfError.message + ". The file appears to be a PDF document, but the content could not be extracted.]";
      }
    }

    // For other document types in this MVP version, we read as binary and report file type
    // In a production environment, specific document parsers would be used
    console.log("Processing document with extension:", ext);
    const fileStats = await fs.promises.stat(documentPath);
    const fileSizeKB = Math.round(fileStats.size / 1024);

    return "[This is a " + ext.replace('.', '') + " document with file size of " + fileSizeKB + "KB. The document appears to contain formatted content that requires specialized parsing. In a production environment, a dedicated parser for " + ext + " files would extract the full content.]";
  } catch (error) {
    console.error("Error extracting document content:", error.message);
    return "[Error extracting document content: " + error.message + "]";
  }
}

/**
 * Process a document for LLM analysis
 * @param {string} documentPath - Path to the document file
 * @returns {Promise<Object>} Document content and metadata
 */
async function processDocument(documentPath) {
  try {
    console.log("Processing document:", documentPath);

    if (!documentPath) {
      console.error("Document path is null or undefined");
      throw new Error("Invalid document path");
    }

    const fileName = path.basename(documentPath);
    const fileExt = path.extname(documentPath).toLowerCase();

    console.log("Processing document:", fileName, "(", fileExt, ")");

    // Extract document content
    const content = await extractDocumentContent(documentPath);

    console.log("Document processing complete for:", fileName);
    return {
      fileName,
      fileType: fileExt.replace('.', ''),
      content
    };
  } catch (error) {
    console.error("Error processing document:", error.message);
    throw error;
  }
}

module.exports = {
  processDocument,
  extractDocumentContent
};