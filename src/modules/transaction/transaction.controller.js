const { PrismaClient } = require("@prisma/client");
const { getPaginationParams, getPaginationMetadata } = require("../../utils/pagination");

const prisma = new PrismaClient();

module.exports = {
  getAllTransactions: async (req, res) => {
    try {
      const { skip, take, pageNumber, limitNumber } = getPaginationParams(req.query);

      const totalTransactions = await prisma.transaction.count();

      const transactions = await prisma.transaction.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      });

      const pagination = getPaginationMetadata(totalTransactions, pageNumber, limitNumber);

      return res.status(200).json({
        code: 200,
        status: "OK",
        ...pagination,
        data: transactions,
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
        message: "Something went wrong",
      });
    } finally {
      prisma.$disconnect();
    }
  },
  getTransactionById: async (req, res) => {},
  createTransaction: async (req, res) => {},
  updateTransaction: async (req, res) => {},
  deleteTransaction: async (req, res) => {},
};
