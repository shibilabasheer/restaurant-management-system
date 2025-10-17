import express from 'express';
import { register, login, me, adminCreateUser, adminUpdateRole , registerAdmin} from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);

router.post('/register-admin', registerAdmin);

// admin user management
router.post('/users', protect, authorize('admin'), adminCreateUser);
router.patch('/users/:id/role', protect, authorize('admin'), adminUpdateRole);

export default router;
