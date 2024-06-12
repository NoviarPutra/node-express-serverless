const B2 = require("backblaze-b2");
const multer = require("multer");
const { checkFileType } = require("../../utils/fileType");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const { BUCKET_NAME, BUCKET_ID, BUCKET_KEY_ID, BUCKET_APP_KEY } = process.env;

// const uploadsDir = path.join(__dirname, "../../../public/uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

const b2 = new B2({
  applicationKeyId: BUCKET_KEY_ID,
  applicationKey: BUCKET_APP_KEY,
});

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
      // const comressedImagePath = path.join(uploadsDir, `${timestamp}.jpeg`);
      const compressBuffer = await sharp(req.file.buffer)
        .resize(800)
        .toFormat("jpeg", { quality: 70 })
        .toBuffer();
      console.log(compressBuffer);
      await b2.authorize();
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: BUCKET_ID,
      });
      const { uploadUrl, authorizationToken } = uploadUrlResponse.data;
      if (!authorizationToken) {
        throw new Error("Authorization token is undefined");
      }
      // console.log("UPLOAD : ", uploadUrl);
      // console.log("TOKEN : ", authorizationToken);
      const uploadedResponse = await b2.uploadFile({
        uploadUrl: uploadUrl,
        authorizationToken: authorizationToken,
        fileName: fileName,
        data: compressBuffer,
        contentType: "image/jpeg",
      });
      return res.status(201).json({
        code: 201,
        status: "CREATED",
        message: "File uploaded successfully",
        // data: { uploaded: uploaded, fileName: fileName, url: `/uploads/${timestamp}.jpeg` },
        data: uploadedResponse,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        ...error,
      });
    }
  });
};

module.exports = { uploadFile };
