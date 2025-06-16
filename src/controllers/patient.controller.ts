import { Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { z } from "zod";
import Patient from "../models/patient/Patient";

// Esquema de validación con Zod
const patientSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  ci: z.string().regex(/^[0-9]{7,10}$/, "CI no válido"),
  phone: z.string().regex(/^(\+591|0)[67][0-9]{7}$/, "Teléfono no válido"),
});

// Crear paciente
export const createPatient = async (req: Request, res: Response) => {
  try {
    // const { success, data, error } = patientSchema.safeParse(req.body);
    const {
      address,
      allergies,
      birthDate,
      ci,
      email,
      dentalNotes,
      gender,
      phone,
      medicalNotes,
      name,
    } = req.body;

    // if (!success) {
    //   return sendResponse({
    //     res,
    //     status: 400,
    //     message: "Datos inválidos",
    //     error,
    //   });
    // }

    console.log(address)

    const patient = await Patient.create({
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
      },
      allergies,
      birthDate,
      ci,
      email,
      dentalNotes,
      gender,
      phone,
      name,
      medicalNotes,
    });

    sendResponse({
      res,
      status: 201,
      message: "Paciente creado",
      data: patient,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return sendResponse({
        res,
        status: 400,
        message: "El paciente ya existe (CI duplicado)",
      });
    }
    sendResponse({
      res,
      status: 500,
      message: "Error al crear paciente",
      error: error.message,
    });
  }
};

// Obtener todos los pacientes (paginados)
export const getPatients = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const patients = await Patient.find()
      .skip((page - 1) * limit)
      .limit(limit);

    sendResponse({ res, message: "Pacientes obtenidos", data: patients });
  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: "Error al obtener pacientes",
      error,
    });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return sendResponse({
        res,
        status: 404,
        message: "Paciente no encontrado",
      });
    }
    sendResponse({ res, message: "Paciente encontrado", data: patient });
  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: "Error al obtener paciente",
      error,
    });
  }
}

// Buscar paciente por CI o nombre
export const searchPatient = async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const patients = await Patient.find({
      $or: [
        { ci: { $regex: query, $options: "i" } },
        { $text: { $search: query } }, // Requiere índice de texto en MongoDB
      ],
    }).limit(10);

    sendResponse({ res, message: "Resultados de búsqueda", data: patients });
  } catch (error) {
    sendResponse({ res, status: 500, message: "Error en la búsqueda", error });
  }
};

// Actualizar paciente
export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!patient) {
      return sendResponse({
        res,
        status: 404,
        message: "Paciente no encontrado",
      });
    }
    sendResponse({ res, message: "Paciente actualizado", data: patient });
  } catch (error) {
    sendResponse({ res, status: 500, message: "Error al actualizar", error });
  }
};

// Eliminar paciente (soft delete)
export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByIdAndUpdate(
      id,
      { isActive: false }, // Campo para soft delete
      { new: true }
    );
    sendResponse({ res, message: "Paciente desactivado", data: patient });
  } catch (error) {
    sendResponse({ res, status: 500, message: "Error al eliminar", error });
  }
};
