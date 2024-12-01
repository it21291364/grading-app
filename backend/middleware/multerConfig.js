const multer = require('multer');

/**
 * Configures multer to use memory storage.
 * Files will be stored in memory as Buffer objects.
 */
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
