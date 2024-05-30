import { Request, Response } from "express";

export const login = (req: Request, res: Response) => {
  return res.status(200).json({ success: true });
};
