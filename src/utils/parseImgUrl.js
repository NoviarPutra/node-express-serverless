const B2 = require("backblaze-b2");
const { BUCKET_ID, BUCKET_KEY_ID, BUCKET_APP_KEY } = process.env;

const b2 = new B2({
  applicationKeyId: BUCKET_KEY_ID,
  applicationKey: BUCKET_APP_KEY,
});
const parseImgUrl = async ({ fileName }) => {
  const authBackblaze = await b2.authorize();

  try {
    const downloadUrlResponse = await b2.getDownloadAuthorization({
      bucketId: BUCKET_ID,
      fileNamePrefix: fileName,
      validDurationInSeconds: 3600,
    });
    const { authorizationToken: token, fileNamePrefix } = downloadUrlResponse.data;
    const url = `${authBackblaze.data.downloadUrl}/file/images-budiawan/${fileNamePrefix}?Authorization=${token}`;
    return url;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { parseImgUrl };
