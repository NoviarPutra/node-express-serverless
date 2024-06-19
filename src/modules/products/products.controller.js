const { PrismaClient } = require("@prisma/client");
const { productSchema } = require("./products.schema");
const { ZodError } = require("zod");
const { getPaginationParams, getPaginationMetadata } = require("../../utils/pagination");

const prisma = new PrismaClient();
module.exports = {
  getAll: async (req, res) => {
    try {
      const { skip, take, pageNumber, limitNumber } = getPaginationParams(req.query);

      const totalProducts = await prisma.product.count();

      const products = await prisma.product.findMany({
        skip,
        take,
        orderBy: { name: "asc" },
        include: {
          category: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, role: true } },
        },
      });

      const pagination = getPaginationMetadata(totalProducts, pageNumber, limitNumber);

      return res.status(200).json({
        code: 200,
        status: "OK",
        ...pagination,
        skip,
        data: products,
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
      return res
        .status(500)
        .json({ code: 500, status: "INTERNAL SERVER ERROR", message: "Something went wrong" });
    } finally {
      await prisma.$disconnect();
    }
  },

  create: async (req, res) => {
    try {
      const body = req.body;
      const isValid = productSchema.parse(body);
      const productExists = await prisma.product.findFirst({
        where: {
          name: isValid.name,
          categoryId: isValid.categoryId,
        },
      });
      if (productExists) {
        return res.status(409).json({
          code: 409,
          status: "CONFLICT",
          message: "Product already exists",
        });
      }
      const categoryExists = await prisma.category.findFirst({
        where: {
          id: isValid.categoryId,
        },
      });
      if (!categoryExists) {
        return res.status(404).json({
          code: 404,
          status: "NOT FOUND",
          message: "Category not found",
        });
      }
      const product = await prisma.product.create({
        data: { ...isValid, createdById: req.user.id },
        include: {
          category: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, role: true } },
        },
      });
      return res.status(201).json({ code: 201, status: "CREATED", data: product });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          code: 400,
          status: "BAD REQUEST",
          message: error.issues,
        });
      }
      console.log(error);
      return res
        .status(500)
        .json({ code: 500, status: "INTERNAL SERVER ERROR", message: "Something went wrong" });
    } finally {
      prisma.$disconnect();
    }
  },
};
