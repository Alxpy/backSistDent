import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendResponse } from "../utils/response";
import User from "../models/user/User";
import Role from "../models/role/Role";
import { IRole } from "../models/role/IRole";
import { JWT_SECRET } from "../config";

// Tipos
interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string; // ID del rol
}

// Login
export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+password")
      .populate<{ role: IRole }>("role");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendResponse({
        res,
        status: 401,
        message: "Credenciales inválidas",
      });
    }

    const token = generateToken(user._id, user.role.name);

    sendResponse({
      res,
      message: "Login exitoso",
      data: {
        token,
        user: { ...user.toObject(), password: undefined },
      },
    });
  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: "Error en el servidor",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Registro
export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validar rol
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return sendResponse({ res, status: 400, message: "Rol no válido" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user._id, roleExists.name);

    sendResponse({
      res,
      status: 201,
      message: "Usuario registrado",
      data: {
        token,
        user: { ...user.toObject(), password: undefined },
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return sendResponse({
        res,
        status: 400,
        message: "El email ya está registrado",
      });
    }
    sendResponse({
      res,
      status: 500,
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

// Validar Token (refresh)
export const validateToken = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).populate<{ role: IRole }>(
      "role"
    );

    if (!user) {
      return sendResponse({
        res,
        status: 404,
        message: "Usuario no encontrado",
      });
    }

    const token = generateToken(user._id, user.role.name);

    sendResponse({
      res,
      message: "Token válido",
      data: {
        token,
        user: { ...user.toObject(), password: undefined },
      },
    });
  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: "Error al validar token",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Helper para generar JWT
const generateToken = (userId: any, role: string) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET!, { expiresIn: "1d" });
};
