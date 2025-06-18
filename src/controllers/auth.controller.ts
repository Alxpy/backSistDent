import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendResponse } from "../utils/response";
import User from "../models/user/User";
import Role from "../models/role/Role";
import { IRole } from "../models/role/IRole";
import { JWT_SECRET } from "../config";

export const generateAdminUser = async () => {
  try {
    
    const adminRole = await Role.findOne({ name: "admin" });

    if (!adminRole) {
      return console.log("El rol de administrador no existe.");
    }

    const adminUser = await User.findOne({ email: "alexanderk92c@gmail.com" });
    if (adminUser) {
      console.log("El usuario administrador ya existe.");
      return;
    }

    const hashedPassword = await bcrypt.hash("1234567", 10);

    const newUser = new User({
      firstName: "Alex",
      lastName: "Admin",
      email: "alexanderk92c@gmail.com",
      password: hashedPassword,
      role: adminRole._id,
    });

    await newUser.save();

    console.log("Usuario administrador creado exitosamente.");
  } catch (error) {
    console.log("Error generating admin user:", error);
  }
}

export const login = async (req: Request, res: Response) => {
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
export const register = async (req: Request, res: Response) => {
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
