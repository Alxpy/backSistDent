import { Router } from 'express';
import { 
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointments,
  updateAppointment
} from '../controllers/appointment.controller';
import { isAuth } from '../interfaces/auth.middleware';

const router = Router();

router.post('/', isAuth, createAppointment);
router.get('/', isAuth, getAppointments);
router.get('/:id', isAuth, getAppointmentById);
router.put('/:id', isAuth, updateAppointment);
router.delete('/:id', isAuth, deleteAppointment)

export default router;