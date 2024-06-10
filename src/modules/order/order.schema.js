const { z } = require("zod");

module.exports = {
  orderSchema: z.object({
    userId: z.string(),
    productId: z.string(),
    quantity: z.number().positive(),
  }),
};
