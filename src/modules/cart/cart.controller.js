const B2 = require("backblaze-b2");
const { PrismaClient } = require("@prisma/client");
const { getPaginationParams, getPaginationMetadata } = require("../../utils/pagination");

const prisma = new PrismaClient();

module.exports = {
  getCartByUserId: async (req, res) => {
    try {
      const { userId } = req.params;
      const { skip, take, pageNumber, limitNumber } = getPaginationParams(req.query);
      const totalCart = await prisma.cart.count({ where: { userId } });
      const cart = await prisma.cart.findMany({
        skip,
        take,
        orderBy: { createdAt: "asc" },
        where: { userId },
        include: { product: true },
      });
      const pagination = getPaginationMetadata(totalCart, pageNumber, limitNumber);
      const authBackblaze = await b2.authorize();
      for (const product of products) {
        const downloadUrlResponse = await b2.getDownloadAuthorization({
          bucketId: BUCKET_ID,
          fileNamePrefix: product.image,
          validDurationInSeconds: 3600,
        });
        const { authorizationToken: token, fileNamePrefix } = downloadUrlResponse.data;
        const url = `${authBackblaze.data.downloadUrl}/file/images-budiawan/${fileNamePrefix}?Authorization=${token}`;
        product.image = url;
      }
      return res.status(200).json({ code: 200, status: "OK", ...pagination, data: cart });
    } catch (error) {
      if (
        error.message === "Page and limit must be positive integers" ||
        error.message === "Limit must be a positive integer" ||
        error.message === "Page must be a positive integer" ||
        error.message === "Skip must be a non-negative integer"
      ) {
        return res.status(400).json({
          code: 400,
          status: "BAD REQUEST",
          message: error.message,
        });
      }
      console.log(error);
      return res.status(500).json({
        code: 500,
        status: "INTERNAL SERVER ERROR",
        message: "Something went wrong",
      });
    } finally {
      await prisma.$disconnect();
    }
  },
};
