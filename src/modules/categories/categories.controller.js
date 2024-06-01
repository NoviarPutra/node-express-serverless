const { PrismaClient } = require("@prisma/client");
const { ZodError } = require("zod");
const { categorySchema } = require("./categories.schema");

const prisma = new PrismaClient();
module.exports = {
  getAll: async (_req, res) => {
    try {
      const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
      return res.status(200).json({ code: 200, status: "OK", data: categories });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ code: 500, status: "INTERNAL SERVER ERROR", message: "Something went wrong" });
    } finally {
      prisma.$disconnect();
    }
  },
  create: async (req, res) => {
    try {
      const body = req.body;
      const isValid = categorySchema.parse(body);
      const categoryExists = await prisma.category.findFirst({
        where: {
          name: isValid.name,
        },
      });
      if (categoryExists) {
        return res.status(409).json({
          code: 409,
          status: "CONFLICT",
          message: "Category already exists",
        });
      }
      const category = await prisma.category.create({
        data: {
          name: isValid.name,
        },
      });
      return res.status(201).json({ code: 201, status: "CREATED", data: category });
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
