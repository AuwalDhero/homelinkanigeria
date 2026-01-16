import { Router } from 'express';
// FIXED: Pointing back to the 'src' folder where the file actually lives
import { getAllProperties, createProperty, updateProperty, deleteProperty } from '../src/controllers/propertyController';
// FIXED: Pointing back to the 'src' folder for middleware too
import { protect, isAgent } from '../src/middleware/auth';

const router = Router();

router.get('/', getAllProperties);
router.post('/', protect, isAgent, createProperty);
router.patch('/:id', protect, isAgent, updateProperty);
router.delete('/:id', protect, isAgent, deleteProperty);

export default router;