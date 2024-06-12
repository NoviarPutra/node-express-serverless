const { PrismaClient } = require("@prisma/client");
const { getPaginationParams, getPaginationMetadata } = require("../../utils/pagination");
const { ZodError } = require("zod");
const { orderSchema } = require("./order.schema");

const prisma = new PrismaClient();

module.exports = {
  getAllOrders: async (req, res) => {
    try {
      const { skip, take, pageNumber, limitNumber } = getPaginationParams(req.query);

      const totalOrders = await prisma.order.count();
      const orders = await prisma.order.findMany({
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          OrderDetails: {
            include: {
              product: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const pagination = getPaginationMetadata(totalOrders, pageNumber, limitNumber);

      return res.status(200).json({
        code: 200,
        status: "OK",
        message: "Get all orders successfully",
        ...pagination,
        data: orders,
      });
    } catch (error) {
      if (error.message === "Page and limit must be positive integers") {
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
        message: error.message,
      });
    } finally {
      prisma.$disconnect();
    }
  },
  createOrder: async (req, res) => {
    try {
      const body = req.body;
      const isValid = orderSchema.parse(body);
      const totalAmount = isValid
        .map((item) => item.price * item.quantity)
        .reduce((a, b) => a + b, 0);
      const order = await prisma.order.create({
        data: {
          userId: req.user.id,
          totalAmount: totalAmount,
          OrderDetails: {
            create: isValid,
          },
        },
        include: {
          OrderDetails: true,
        },
      });
      return res.status(201).json({
        code: 201,
        status: "CREATED",
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          code: 400,
          status: "BAD REQUEST",
          message: error.issues.map((issue) => {
            return issue.message;
          }),
        });
      }
      console.log(error);
      return res.status(500).json({
        code: 500,
        status: "INTERNAL SERVER ERROR",
        message: error.message,
      });
    } finally {
      prisma.$disconnect();
    }
  },
  getOrderById: async (req, res) => {},
  updateOrder: async (req, res) => {},
  deleteOrder: async (req, res) => {},
};
