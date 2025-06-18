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

const patients = [
  {
    name: "Juan Pérez",
    ci: "12345678",
    birthDate: "1985-05-15T00:00:00.000Z",
    gender: "male",
    phone: "+59170012345",
    email: "juan.perez@email.com",
    address: {
      city: "La Paz",
      zone: "Zona Sur",
      street: "Calle 15 #456",
    },
    medicalRecords: [
      {
        type: "allergy",
        name: "Penicilina",
        severity: "high",
        notes: "Reacción anafiláctica en exposición previa",
      },
      {
        type: "chronic_disease",
        name: "Diabetes tipo 2",
        severity: "medium",
        notes: "Diagnosticado en 2015",
      },
    ],
  },
  {
    name: "María González",
    ci: "87654321",
    birthDate: "1990-08-22T00:00:00.000Z",
    gender: "female",
    phone: "+59172098765",
    email: "maria.gonzalez@email.com",
    address: {
      city: "Cochabamba",
      street: "Av. Heroínas #789",
    },
    medicalRecords: [
      {
        type: "surgery",
        name: "Apendicectomía",
        severity: "low",
        notes: "Realizada en 2018",
      },
    ],
  },
  {
    name: "Carlos Rodríguez",
    ci: "45678912",
    birthDate: "1978-11-30T00:00:00.000Z",
    gender: "male",
    phone: "+59173045678",
    email: "carlos.rodriguez@email.com",
    medicalRecords: [
      {
        type: "medication",
        name: "Atorvastatina",
        severity: "medium",
        notes: "Toma diaria para colesterol",
      },
      {
        type: "chronic_disease",
        name: "Hipertensión",
        severity: "medium",
      },
    ],
  },
  {
    name: "Ana Martínez",
    ci: "78912345",
    birthDate: "1995-03-10T00:00:00.000Z",
    gender: "female",
    phone: "+59174078912",
    email: "ana.martinez@email.com",
    address: {
      city: "Santa Cruz",
      zone: "Plan 3000",
    },
    medicalRecords: [
      {
        type: "allergy",
        name: "Mariscos",
        severity: "high",
      },
      {
        type: "other",
        name: "Fractura de brazo",
        severity: "low",
        notes: "2019, recuperación completa",
      },
    ],
  },
  {
    name: "Luis Fernández",
    ci: "32165498",
    birthDate: "1982-07-18T00:00:00.000Z",
    gender: "male",
    phone: "+59175032165",
    email: "luis.fernandez@email.com",
    medicalRecords: [],
  },
  {
    name: "Sofía Vargas",
    ci: "65498732",
    birthDate: "1992-09-25T00:00:00.000Z",
    gender: "female",
    phone: "+59176065498",
    email: "sofia.vargas@email.com",
    address: {
      city: "Sucre",
      street: "Calle Estudiantes #321",
    },
    medicalRecords: [
      {
        type: "chronic_disease",
        name: "Asma",
        severity: "medium",
        notes: "Usa inhalador cuando es necesario",
      },
    ],
  },
  {
    name: "Pedro Sánchez",
    ci: "98732165",
    birthDate: "1975-12-05T00:00:00.000Z",
    gender: "male",
    phone: "+59171098732",
    email: "pedro.sanchez@email.com",
    medicalRecords: [
      {
        type: "surgery",
        name: "Cirugía de rodilla",
        severity: "medium",
        notes: "2017, requiere rehabilitación ocasional",
      },
      {
        type: "medication",
        name: "Ibuprofeno",
        severity: "low",
        notes: "Para dolor ocasional",
      },
    ],
  },
  {
    name: "Elena Morales",
    ci: "14725836",
    birthDate: "1988-04-20T00:00:00.000Z",
    gender: "female",
    phone: "+59172014725",
    email: "elena.morales@email.com",
    address: {
      city: "Tarija",
      zone: "Centro",
    },
    medicalRecords: [
      {
        type: "allergy",
        name: "Polvo",
        severity: "medium",
      },
      {
        type: "chronic_disease",
        name: "Migraña",
        severity: "low",
      },
    ],
  },
  {
    name: "Jorge Rojas",
    ci: "25836914",
    birthDate: "1998-01-15T00:00:00.000Z",
    gender: "male",
    phone: "+59173025836",
    email: "jorge.rojas@email.com",
    medicalRecords: [
      {
        type: "other",
        name: "Donación de sangre",
        severity: "low",
        notes: "Donador frecuente",
      },
    ],
  },
  {
    name: "Daniela Castro",
    ci: "36914725",
    birthDate: "1993-06-08T00:00:00.000Z",
    gender: "female",
    phone: "+59174036914",
    email: "daniela.castro@email.com",
    address: {
      city: "Oruro",
      street: "Av. 6 de Agosto #789",
    },
    medicalRecords: [
      {
        type: "medication",
        name: "Anticonceptivos",
        severity: "low",
      },
      {
        type: "allergy",
        name: "Nueces",
        severity: "high",
        notes: "Evitar completamente",
      },
    ],
  },
];

export const generatePatients = async () => {
  try {
    const count = await Patient.countDocuments();
    if (count > 0) {
      console.log("Ya existen pacientes en la base de datos.");
      return;
    }

    for (const patientData of patients) {
      const patient = new Patient({
        ...patientData,
        birthDate: new Date(patientData.birthDate),
        medicalRecords: patientData.medicalRecords || [],
      });
      await patient.save();
      console.log(`Paciente ${patient.name} creado exitosamente.`);
    }

  } catch (error) {
    console.log("Error generating patients:", error);
  }
};

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
