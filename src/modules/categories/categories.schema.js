const { z } = require("zod");

module.exports = {
  categorySchema: z.object({
    name: z.string().min(3).max(20).toUpperCase(),
  }),
};
