import { Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { z } from "zod";
import Patient from "../models/patient/Patient";
import Appointment from "../models/appointment/Appointment";

const medicalRecordSchema = z.object({
  type: z.enum([
    "allergy",
    "chronic_disease",
    "surgery",
    "medication",
    "other",
  ]),
  name: z.string().min(2, "Nombre demasiado corto"),
  severity: z.enum(["low", "medium", "high"]).optional(),
  diagnosisDate: z.string().datetime().optional(), // ISO 8601
  notes: z.string().optional(),
});

export const createPatientSchema = z.object({
  name: z.string().min(3, "Nombre demasiado corto"),
  ci: z.string().regex(/^[0-9]{7,10}$/, "CI no válido"),
  birthDate: z.string(),
  gender: z.enum(["male", "female", "other", "unspecified"]),
  phone: z.string().regex(/^\+591[67]\d{7}$/, "Teléfono no válido"),
  email: z.string().email().optional(),
  address: z
    .object({
      city: z.string().min(2),
      zone: z.string().optional(),
      street: z.string().optional(),
    })
    .optional(),
  medicalRecords: z.array(medicalRecordSchema).optional(),
});

// Crear paciente
export const createPatient = async (req: Request, res: Response) => {
  try {

    const validation = createPatientSchema.safeParse(req.body);
    if (!validation.success) {
      return sendResponse({
        res,
        status: 400,
        message: "Datos inválidos",
        error: validation.error.errors,
      });
    }

    const patientData = {
      ...validation.data,
      birthDate: validation.data.birthDate
        ? new Date(validation.data.birthDate)
        : undefined,
      medicalRecords: validation.data.medicalRecords,
    };

    const patient = await Patient.create(patientData);

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
    const patients = await Patient.find({ isActive: true }) // Solo pacientes activos
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
    const patient = await Patient.findById(id).lean();

    if (!patient) {
      return sendResponse({
        res,
        status: 404,
        message: "Paciente no encontrado",
      });
    }

    const appointments = await Appointment.find({
      patient: id,
      status: { $ne: "cancelled" },
    })
      .populate("treatment")
      .lean();

    const data = {
      ...patient,
      treatments: appointments.map((appointment) => appointment.treatment),
    };

    sendResponse({ res, message: "Paciente encontrado", data });
  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: "Error al obtener paciente",
      error,
    });
  }
};

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
