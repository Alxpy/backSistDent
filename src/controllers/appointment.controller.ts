import { Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { isBefore, addMinutes, format, parseISO, addDays } from "date-fns";
import { z } from "zod";
import Patient from "../models/patient/Patient";
import User from "../models/user/User";
import Appointment from "../models/appointment/Appointment";
import { IAppointment } from "../models/appointment/IAppointment";

// Esquema de validación con Zod
const appointmentSchema = z.object({
  patient: z.string().regex(/^[0-9a-fA-F]{24}$/),
  treatment: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number().min(15).max(240), // 15 mins a 4 horas
  notes: z.string().optional(),
});

// Crear cita
export const createAppointment = async (req: Request, res: Response) => {
  try {
    console.log(req.body);

    const { success, data, error } = appointmentSchema.safeParse(req.body);
    if (!success) {
      return sendResponse({
        res,
        status: 400,
        message: "Datos inválidos",
        error,
      });
    }

    const { patient, treatment, startTime, duration, endTime } = data;
    const startDate = parseISO(startTime);

    if (isBefore(startDate, new Date())) {
      return sendResponse({
        res,
        status: 400,
        message: "No se puede agendar en el pasado",
      });
    }

    // Verificar disponibilidad del dentista
    const conflictingAppointment = await Appointment.findOne({
      dentist: req.user?.id,
      startTime: { $lt: addMinutes(startDate, duration) },
      endTime: { $gt: startDate },
      status: { $ne: "cancelled" },
    });

    if (conflictingAppointment) {
      return sendResponse({
        res,
        status: 409,
        message: "El dentista ya tiene una cita en ese horario",
        data: {
          conflict: {
            start: conflictingAppointment.startTime,
            end: conflictingAppointment.endTime,
          },
        },
      });
    }

    // Crear cita
    const appointment = await Appointment.create({
      patient: patient,
      dentist: req.user?.id,
      treatment: treatment,
      startTime: startDate,
      endTime,
      duration,
      notes: data.notes,
    });

    // Simular recordatorio (luego se integrará WhatsApp/Email)
    await sendReminder(appointment);

    sendResponse({
      res,
      status: 201,
      message: "Cita agendada",
      data: appointment,
    });
  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: "Error al agendar cita",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, duration, notes, status } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return sendResponse({
        res,
        status: 404,
        message: "Cita no encontrada o no autorizada",
      });
    }

    const startDate = parseISO(startTime);

    if (isBefore(startDate, new Date())) {
      return sendResponse({
        res,
        status: 400,
        message: "No se puede agendar en el pasado",
      });
    }

    const conflictingAppointment = await Appointment.findOne({
      dentist: req.user?.id,
      _id: { $ne: id }, // Excluir la cita actual
      startTime: { $lt: addMinutes(startDate, duration) },
      endTime: { $gt: startDate },
      status: { $ne: "cancelled" },
    });

    if (conflictingAppointment) {
      return sendResponse({
        res,
        status: 409,
        message: "El dentista ya tiene una cita en ese horario",
        data: {
          conflict: {
            start: conflictingAppointment.startTime,
            end: conflictingAppointment.endTime,
          },
        },
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        startTime: startDate,
        endTime: endTime ? parseISO(endTime) : addMinutes(startDate, duration),
        duration,
        notes,
        status,
      },
      { new: true }
    ).populate("patient");

    if (!updatedAppointment) {
      return sendResponse({
        res,
        status: 404,
        message: "Cita no encontrada",
      });
    }

    await sendReminder(updatedAppointment);
    sendResponse({
      res,
      message: "Cita actualizada",
      data: updatedAppointment,
    });
  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: "Error al actualizar cita",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id).populate(
      "patient treatment dentist"
    );
    if (!appointment) {
      return sendResponse({
        res,
        status: 404,
        message: "Cita no encontrada",
      });
    }
    // Aquí podrías enviar un recordatorio de cancelación si es necesario
    sendResponse({
      res,
      message: "Cita cancelada",
      data: appointment,
    });
  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: "Error al cancelar cita",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Simulador de recordatorio (Fase 1)
const sendReminder = async (appointment: IAppointment & { _id: any }) => {
  const patient = await Patient.findById(appointment.patient);
  const dentist = await User.findById(appointment.dentist);

  console.log(`📅 Recordatorio simulado:
  Paciente: ${patient?.name}
  Dentista: Dr. ${dentist?.lastName}`);
  // Actualizar estado (en producción se haría con un cron job)
  await Appointment.findByIdAndUpdate(appointment._id, { reminderSent: true });
};

// Obtener citas por dentista/fecha
export const getAppointments = async (req: Request, res: Response) => {
  try {
    // const { date = new Date() } = req.query;
    const appointments = await Appointment.find({}).populate(
      "patient treatment dentist"
    );

    sendResponse({ res, message: "Citas obtenidas", data: appointments });
  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: "Error al obtener citas",
      error,
    });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id).populate(
      "patient treatment"
    );

    console.log(appointment);

    if (!appointment) {
      return sendResponse({
        res,
        status: 404,
        message: "Cita no encontrada",
      });
    }

    sendResponse({ res, message: "Cita obtenida", data: appointment });
  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: "Error al obtener cita",
      error,
    });
  }
};
