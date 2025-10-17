// server/routes/orders.js
import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { createOrder, getOrder, updateStatus, myOrders } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, myOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin','staff'), updateStatus);

export default router;
