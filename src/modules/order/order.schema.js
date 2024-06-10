const { z } = require("zod");

module.exports = {
  orderSchema: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .min(1, "Order details cannot be empty"),
};
