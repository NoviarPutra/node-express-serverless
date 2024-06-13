const B2 = require("backblaze-b2");
const multer = require("multer");
const { checkFileType } = require("../../utils/fileType");
const sharp = require("sharp");

const { BUCKET_NAME, BUCKET_ID, BUCKET_KEY_ID, BUCKET_APP_KEY } = process.env;

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
      const filename = `${timestamp}.jpeg`;
      const compressBuffer = await sharp(req.file.buffer)
        .resize(800)
        .toFormat("jpeg", { quality: 70 })
        .toBuffer();
      const auth = await b2.authorize();
      const uploadUrlResponse = await b2.getUploadUrl({
        bucketId: BUCKET_ID,
      });
      const { uploadUrl, authorizationToken } = uploadUrlResponse.data;
      if (!authorizationToken) {
        throw new Error("Authorization token is undefined");
      }
      const uploadedResponse = await b2.uploadFile({
        uploadUrl: uploadUrl,
        uploadAuthToken: authorizationToken,
        fileName: filename,
        data: compressBuffer,
      });
      const { fileId, fileName } = uploadedResponse.data;

      const downloadUrlResponse = await b2.getDownloadAuthorization({
        bucketId: BUCKET_ID,
        fileNamePrefix: fileName,
        validDurationInSeconds: 3600,
      });
      const { authorizationToken: authToken, fileNamePrefix } = downloadUrlResponse.data;

      const publicPath = `${auth.data.downloadUrl}/file/images-budiawan/${fileNamePrefix}`;
      const privatePath = `${auth.data.downloadUrl}/file/images-budiawan/${fileNamePrefix}?Authorization=${authToken}`;

      return res.status(201).json({
        code: 201,
        status: "CREATED",
        message: "File uploaded successfully",
        data: {
          fileId,
          fileName,
          path: { publicPath, privatePath, note: "Duration is 1 hour for privatePath" },
        },
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
