import express from 'express';
import { createOrder, getOrder, updateStatus, myOrders, listAllOrders } from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect,createOrder);
router.get('/my', protect, myOrders);      
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, updateStatus);
router.get('/admin/orders', protect, listAllOrders);       

export default router;


