const z = require("zod");

module.exports = {
  productSchema: z.object({
    name: z.string().min(3).max(20).toUpperCase(),
    categoryId: z.string(),
    price: z.number().positive(),
    stock: z.number().positive(),
    image: z.string().optional(),
    description: z.string().max(200).optional(),
    status: z.boolean().optional(),
  }),
};
