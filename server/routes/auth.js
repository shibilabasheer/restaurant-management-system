import express from 'express';
import { register, login, me, listUsers,adminCreateUser,deleteUser, adminUpdateRole , registerAdmin , listStaffs ,staffDashboard} from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.get('/listUsers', listUsers);

router.post('/register-admin', registerAdmin);

// admin user management
router.post('/users', protect, authorize('admin'), adminCreateUser);
router.patch('/users/:id/role', protect, authorize('admin'), adminUpdateRole);
router.get('/staffs', listStaffs);
router.delete('/users', protect, authorize('admin'), deleteUser);

router.get('/staff/dashboard',staffDashboard);


export default router;
