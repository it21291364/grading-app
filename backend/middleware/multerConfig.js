const multer = require('multer');

// Use in-memory storage for uploaded files
const storage = multer.memoryStorage();

// Configure multer with the defined storage settings
const upload = multer({ storage });

module.exports = upload;
