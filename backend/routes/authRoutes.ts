import { Router } from 'express';
import { registerAgent, login } from '../src/controllers/authController';

const router = Router();

router.post('/register', registerAgent);
router.post('/login', login);

export default router;