import { Router } from 'express';
import { 
  login, 
  register, 
  validateToken 
} from '../controllers/auth.controller';
import { isAuth } from '../interfaces/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/validate-token', isAuth, validateToken);

export default router;