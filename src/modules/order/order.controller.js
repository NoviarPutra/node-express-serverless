const { PrismaClient } = require("@prisma/client");
const { getPaginationParams, getPaginationMetadata } = require("../../utils/pagination");

const prisma = new PrismaClient();

module.exports = {
  getAllOrders: async (req, res) => {
    try {
      const { skip, take, pageNumber, limitNumber } = getPaginationParams(req.query);

      const totalOrders = await prisma.order.count();
      const orders = await prisma.order.findMany({
        skip,
        take,
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
  createOrder: async (req, res) => {},
  getOrderById: async (req, res) => {},
  updateOrder: async (req, res) => {},
  deleteOrder: async (req, res) => {},
};
