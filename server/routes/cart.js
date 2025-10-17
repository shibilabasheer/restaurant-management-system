
import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getMyCart, updateItem, addItem, removeItem, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.get('/', protect, getMyCart);
router.patch('/item/:menuId', protect, updateItem);
router.post('/item', protect, addItem);
router.delete('/item/:menuId', protect, removeItem);
router.delete('/', protect, clearCart);

export default router;
