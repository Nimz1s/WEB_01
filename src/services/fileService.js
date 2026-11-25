const fs = require('fs');
const path = require('path');

function deleteFile(fileUrl) {
  if (!fileUrl) return;

  const filename = path.basename(fileUrl);
  const filePath = path.join(process.cwd(), 'uploads', filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  deleteFile
};