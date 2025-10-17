
import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createReservation, myReservations } from '../controllers/reservationController.js';

const router = express.Router();

router.post('/', protect, createReservation);
router.get('/', protect, myReservations);

export default router;
