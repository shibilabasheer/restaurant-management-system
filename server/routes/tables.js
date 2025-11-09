
import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { listTables, createTable, updateTable , deleteTable,setAvailability ,listAvailableTables} from '../controllers/tableController.js';

const router = express.Router();

router.get('/', protect, authorize('admin','staff','customer'), listTables);
router.post('/', protect, authorize('admin','staff','customer'), createTable);
router.patch('/:id/availability', protect, authorize('admin','staff'), setAvailability);
router.put('/:id', protect, authorize('admin','staff','customer'), updateTable);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteTable);
router.get('/available', listAvailableTables); 

export default router;
