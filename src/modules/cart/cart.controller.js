const { PrismaClient } = require("@prisma/client");
const { insertCartSchema } = require("./cart.schema");
const { ZodError } = require("zod");
const { parseImgUrl } = require("../../utils/parseImgUrl");

const prisma = new PrismaClient();

module.exports = {
  getCartByUserId: async (req, res) => {
    try {
      const userId = req.user.id;
      const cart = await prisma.$queryRaw`
        SELECT 
          c.id,
          c."userId",
          c."productId",
          p.name AS "productName",
          p.image AS "productImage",
          p.price AS "productPrice",
          c.quantity AS "productQuantity",
          (p.price * c.quantity::FLOAT) AS "totalPrice",
          c.note AS "note"  
        FROM "Cart" c
        INNER JOIN "Product" p ON c."productId" = p.id
        WHERE c."userId" = ${userId}
      `;

      for (const item of cart) {
        item.productImage = await parseImgUrl({ fileName: item.productImage });
      }

      return res.status(200).json({
        code: 200,
        status: "OK",
        message: "Cart retrieved successfully",
        data: cart,
      });
    } catch (error) {
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
