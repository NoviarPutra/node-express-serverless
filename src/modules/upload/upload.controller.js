const multer = require("multer");
const { checkFileType } = require("../../utils/fileType");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "../../../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// const storage = multer.diskStorage({
//   destination: function (_req, _file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (_req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: (_req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("file");
const uploadFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        code: 400,
        status: "BAD REQUEST",
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        code: 400,
        status: "BAD REQUEST",
        message: "No file uploaded",
      });
    }

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}.jpeg`;
      const comressedImagePath = path.join(uploadsDir, `${timestamp}.jpeg`);
      const uploaded = await sharp(req.file.buffer)
        .resize(800)
        .toFormat("jpeg", { quality: 70 })
        .toFile(comressedImagePath);
      return res.status(201).json({
        code: 201,
        status: "CREATED",
        message: "File uploaded successfully",
        data: { uploaded: uploaded, fileName: fileName, url: `/uploads/${timestamp}.jpeg` },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 500,
        status: "INTERNAL SERVER ERROR",
        message: "Compressing image failed",
      });
    }
  });
};

module.exports = { uploadFile };
