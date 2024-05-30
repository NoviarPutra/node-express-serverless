import express from "express";
import { login } from "./authentication.controller";

const router = express.Router();

router.get("/", login);

export default router;
