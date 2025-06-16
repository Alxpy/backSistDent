import { Router } from 'express';
import {
  createTreatment,
  getTreatments,
  updateTreatment,
  deleteTreatment
} from '../controllers/treatment.controller';
import { isAuth } from '../interfaces/auth.middleware';

const router = Router();

router.post('/', isAuth, createTreatment);
router.get('/', getTreatments);
router.patch('/:id', isAuth, updateTreatment);
router.delete('/:id', isAuth, deleteTreatment);
router.put('/:id', isAuth, updateTreatment);

export default router;