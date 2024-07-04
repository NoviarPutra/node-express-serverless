const B2 = require("backblaze-b2");
const { PrismaClient } = require("@prisma/client");
const { getPaginationParams, getPaginationMetadata } = require("../../utils/pagination");
const { insertCartSchema } = require("./cart.schema");
const { ZodError } = require("zod");

const prisma = new PrismaClient();
const { BUCKET_ID, BUCKET_KEY_ID, BUCKET_APP_KEY } = process.env;
const b2 = new B2({
  applicationKeyId: BUCKET_KEY_ID,
  applicationKey: BUCKET_APP_KEY,
});

module.exports = {
  getCartByUserId: async (req, res) => {
    try {
      // const { userId } = req.params;
      const { skip, take, pageNumber, limitNumber } = getPaginationParams(req.query);
      const totalCart = await prisma.cart.count({ where: { userId: req.user.id } });
      const cart = await prisma.cart.findMany({
        // skip,
        // take,
        orderBy: { createdAt: "asc" },
        where: { userId: req.user.id },
        include: { product: true },
      });
      const totalPrice = cart.reduce((acc, item) => acc + item.total, 0);
      // const pagination = getPaginationMetadata(totalCart, pageNumber, limitNumber);
      const products = cart.map((cart) => cart.product);
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
      return res.status(200).json({
        code: 200,
        status: "OK",
        // ...pagination,
        totalPrice,
        data: cart,
      });
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
  insertCart: async (req, res) => {
    try {
      const isValid = insertCartSchema.parse(req.body);
      const userExist = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      const productExists = await prisma.product.findUnique({
        where: { id: isValid.productId },
      });
      const cartExists = await prisma.cart.findFirst({
        where: {
          userId: req.user.id,
          productId: isValid.productId,
        },
      });
      const qty = cartExists ? cartExists.quantity + isValid.quantity : isValid.quantity;

      if (!userExist) {
        return res
          .status(404)
          .json({ code: 404, status: "NOT FOUND", message: "User not found" });
      }
      if (!productExists) {
        return res
          .status(404)
          .json({ code: 404, status: "NOT FOUND", message: "Product not found" });
      }

      if (qty > productExists.stock) {
        return res.status(400).json({
          code: 400,
          status: "BAD REQUEST",
          message: "Quantity exceeds product quantity",
        });
      }
      if (cartExists !== null) {
        if (isValid.quantity > productExists.stock) {
          return res.status(400).json({
            code: 400,
            status: "BAD REQUEST",
            message: "Quantity exceeds product quantity",
          });
        }

        const updateCart = await prisma.cart.update({
          where: {
            id: cartExists.id,
          },
          data: {
            userId: req.user.id,
            ...isValid,
            quantity: qty,
            unitPrice: productExists.price,
            total: qty * productExists.price,
          },
        });
        return res.status(201).json({ code: 201, status: "CREATED", data: updateCart });
      }

      const cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
          ...isValid,
          quantity: qty,
          unitPrice: productExists.price,
          total: qty * productExists.price,
        },
      });
      return res.status(201).json({ code: 201, status: "CREATED", data: cart });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          code: 400,
          status: "BAD REQUEST",
          message: error.issues,
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
