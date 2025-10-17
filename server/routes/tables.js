
import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { listTables, createTable, updateTable , deleteTable,setAvailability } from '../controllers/tableController.js';

const router = express.Router();

router.get('/', protect, authorize('admin','staff'), listTables);
router.post('/', protect, authorize('admin','staff'), createTable);
router.patch('/:id/availability', protect, authorize('admin','staff'), setAvailability);
router.put('/:id', protect, authorize('admin','staff'), updateTable);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteTable);

export default router;
