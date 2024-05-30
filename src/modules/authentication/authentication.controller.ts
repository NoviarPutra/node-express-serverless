import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { loginSchema, registerSchema } from "./authentication.schema";
import { ZodError } from "zod";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const { JWT_SECRET_KEY, JWT_EXPIRES_IN } = process.env;
    const body = req.body;
    const isValid = loginSchema.parse(body);
    const userExists = await prisma.user.findUnique({
      where: {
        email: isValid.email,
      },
    });

    if (!userExists) {
      return res.status(404).json({
        code: 404,
        status: "NOT FOUND",
        message: "User not found",
      });
    }
    const isPasswordValid: boolean = await compare(isValid.password, userExists.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        status: "UNAUTHORIZED",
        message: "Invalid password",
      });
    }
    const { password, ...data } = userExists;
    const token: string = sign(data, `${JWT_SECRET_KEY}`, { expiresIn: `${JWT_EXPIRES_IN}h` });
    return res.status(200).json({
      code: 200,
      status: "OK",
      message: "User found",
      data: userExists,
      token: token,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        code: 400,
        status: "BAD REQUEST",
        message: error.issues,
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
};

export const register = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const isValid = registerSchema.parse(body);
    const userExists = await prisma.user.findUnique({
      where: {
        email: isValid.email,
      },
    });

    if (userExists) {
      return res.status(409).json({
        code: 409,
        status: "CONFLICT",
        message: "User already exists",
      });
    }
    const hashedPassword: string = await hash(isValid.password, 10);
    const user = await prisma.user.create({
      data: {
        ...isValid,
        password: hashedPassword,
      },
    });

    const { password, ...data } = user;

    return res.status(201).json({
      code: 201,
      status: "CREATED",
      message: "User created successfully",
      data: data,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        code: 400,
        status: "BAD REQUEST",
        message: error.issues,
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
};
