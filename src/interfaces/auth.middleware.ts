import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response";
import { JWT_SECRET } from "../config";

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return sendResponse({
      res,
      status: 401,
      message: "Token no proporcionado",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    req.user = decoded; // Añade user al request
    next();
  } catch (error) {
    sendResponse({ res, status: 401, message: "Token inválido" });
  }
};
