import { Router } from 'express';
import { 
  createPatient,
  getPatients,
  searchPatient,
  updatePatient,
  deletePatient,
  getPatientById
} from '../controllers/patient.controller';
import { isAuth } from '../interfaces/auth.middleware';

const router = Router();

router.post('/', createPatient);
router.get('/', getPatients);
router.get('/:id', getPatientById)
router.get('/search/:query', isAuth, searchPatient);
router.patch('/:id', isAuth, updatePatient);
router.delete('/:id', isAuth, deletePatient);

export default router;