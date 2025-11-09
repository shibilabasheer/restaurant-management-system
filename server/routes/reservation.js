
import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createReservation, myReservations , getAllReservations , updateReservationStatus , deleteReservation} from '../controllers/reservationController.js';

const router = express.Router();

router.post('/', protect, createReservation);
router.get('/', protect, myReservations);
router.get('/all', protect, getAllReservations);
router.patch('/:id/status', protect, updateReservationStatus);
router.delete('/:id', protect, deleteReservation);

export default router;
