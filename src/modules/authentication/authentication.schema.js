const { z } = require("zod");

module.exports = {
  loginSchema: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  registerSchema: z.object({
    name: z.string().min(3).max(20).toUpperCase(),
    email: z.string().email(),
    password: z.string().min(6).max(20),
    role: z.enum(["USER", "ADMIN"]).optional(),
  }),
};
