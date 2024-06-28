const { z } = require("zod");

const insertCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
});

module.exports = { insertCartSchema };
