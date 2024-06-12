const path = require("path");
const checkFileType = (file, cb) => {
  const fileType = /jpeg|jpg|png|gif/;
  const extname = fileType.test(path.extname(file.originalname).toLowerCase());
  const mime = fileType.test(file.mimetype);

  if (extname && mime) {
    return cb(null, true);
  } else {
    cb("Error: File upload only supports the following filetypes - " + fileType);
  }
};

module.exports = { checkFileType };
