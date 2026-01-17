import { Router } from 'express';
import { getPendingAgents, updateAgentStatus, getPendingProperties, updatePropertyStatus } from '../src/controllers/adminController.js';
import { protect, isAdmin } from '../src/middleware/auth.js';

const router = Router();

router.use(protect, isAdmin); // Protect all admin routes

router.get('/agents/pending', getPendingAgents);
router.patch('/agents/:id/status', updateAgentStatus);

router.get('/properties/pending', getPendingProperties);
router.patch('/properties/:id/status', updatePropertyStatus);

export default router;