import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import { z } from 'zod';
import Treatment from '../models/treatment/Treatment';

const tratments = [
  {
    name: "Limpieza dental",
    description: "Limpieza profunda de dientes y encías",
    price: 50,
    duration: 30,
    isActive: true
  },
  {
    name: "Blanqueamiento dental",
    description: "Tratamiento para blanquear los dientes",
    price: 100,
    duration: 60,
    isActive: true
  },
  {
    name: "Ortodoncia",
    description: "Corrección de dientes y mandíbulas desalineadas",
    price: 1500,
    duration: 120,
    isActive: true
  },
  {
    name: "Endodoncia",
    description: "Tratamiento de conductos radiculares",
    price: 200,
    duration: 90,
    isActive: true
  },
  {
    name: "Extracción dental",
    description: "Extracción de dientes dañados o no erupcionados",
    price: 80,
    duration: 45,
    isActive: true
  }
]

export const generateTreatments = async () => {
  try {
    // Verificar si ya existen tratamientos
    const existingTreatments = await Treatment.countDocuments();
    if (existingTreatments > 0) {
      console.log('Tratamientos ya existen, no se generarán nuevos.');
      return;
    }

    // Crear tratamientos de ejemplo
    const createdTreatments = await Treatment.insertMany(tratments);
    console.log(`Se han creado ${createdTreatments.length} tratamientos de ejemplo.`);
  } catch (error) {
    console.error('Error al generar tratamientos de ejemplo:', error);
  }
}

// Esquema de validación con Zod
const treatmentSchema = z.object({
  name: z.string().min(3, 'Nombre demasiado corto'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  duration: z.number().min(15, 'La duración mínima es 15 minutos'),
  // category: z.enum(['preventivo', 'restaurativo', 'estético', 'ortodoncia'])
});

// Crear tratamiento
export const createTreatment = async (req: Request, res: Response) => {
  try {
    const validation = treatmentSchema.safeParse(req.body);
    if (!validation.success) {
      return sendResponse({
        res,
        status: 400,
        message: 'Datos inválidos',
        error: validation.error.issues
      });
    }

    const treatment = await Treatment.create(validation.data);
    sendResponse({
      res,
      status: 201,
      message: 'Tratamiento creado',
      data: treatment
    });

  } catch (error: any) {
    if (error.code === 11000) {
      return sendResponse({
        res,
        status: 400,
        message: 'El nombre del tratamiento ya existe'
      });
    }
    sendResponse({
      res,
      status: 500,
      message: 'Error al crear tratamiento',
      error: error.message
    });
  }
};

// Obtener todos los tratamientos (activos)
export const getTreatments = async (req: Request, res: Response) => {
  try {
    // const { category } = req.query;
    // const filter = { isActive: true };
    // if (category) filter['category'] = category as string;

    const treatments = await Treatment.find();
    sendResponse({
      res,
      message: 'Tratamientos obtenidos',
      data: treatments
    });

  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: 'Error al obtener tratamientos',
      error
    });
  }
};

// Actualizar tratamiento
export const updateTreatment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = treatmentSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return sendResponse({
        res,
        status: 400,
        message: 'Datos inválidos',
        error: validation.error.issues
      });
    }

    const treatment = await Treatment.findByIdAndUpdate(
      id,
      validation.data,
      { new: true }
    );

    if (!treatment) {
      return sendResponse({
        res,
        status: 404,
        message: 'Tratamiento no encontrado'
      });
    }

    sendResponse({
      res,
      message: 'Tratamiento actualizado',
      data: treatment
    });

  } catch (error: any) {
    if (error.code === 11000) {
      return sendResponse({
        res,
        status: 400,
        message: 'El nombre del tratamiento ya existe'
      });
    }
    sendResponse({
      res,
      status: 500,
      message: 'Error al actualizar tratamiento',
      error: error.message
    });
  }
};

// Desactivar tratamiento (soft delete)
export const deleteTreatment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const treatment = await Treatment.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!treatment) {
      return sendResponse({
        res,
        status: 404,
        message: 'Tratamiento no encontrado'
      });
    }

    sendResponse({
      res,
      message: 'Tratamiento desactivado',
      data: treatment
    });

  } catch (error) {
    sendResponse({
      res,
      status: 500,
      message: 'Error al desactivar tratamiento',
      error
    });
  }
};