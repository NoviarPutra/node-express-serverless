const { z } = require("zod");

module.exports = {
  transactionSchema: z.object({
    userId: z.string(),
    productId: z.string(),
    quantity: z.number().positive(),
  }),
};
