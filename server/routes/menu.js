import express from 'express';
import { listMenu, createMenu, updateMenu, deleteMenu ,toggleActive } from '../controllers/menuController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', listMenu);
router.post('/', protect, authorize('admin','staff'), createMenu);
router.put('/:id', protect, authorize('admin','staff'), updateMenu);
router.patch('/:id/toggle', protect, authorize('admin','staff'), toggleActive);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteMenu);

export default router;
