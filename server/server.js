import { configDotenv } from 'dotenv'
import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
configDotenv()
connectDB();

import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import tableRoutes from './routes/tables.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import reservationRoutes from './routes/reservation.js';

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/table', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/cart', cartRoutes);

// error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
