
import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';

const SLOT_MINUTES = parseInt(process.env.SLOT_MINUTES || '60', 10);
// If you want more than one party per table per slot, set PER_TABLE_LIMIT > 1
const PER_TABLE_LIMIT = parseInt(process.env.PER_TABLE_LIMIT || '1', 10);

export const createReservation = async (req, res) => {
  try {
    const { date, partySize, name, phone, table } = req.body;
    if (!date || !partySize || !table) {
      return res.status(400).json({ message: 'date, partySize, table required' });
    }

    // Check table exists
    const tbl = await Table.findById(table);
    if (!tbl) return res.status(400).json({ message: 'Invalid table' });

    // Build the slot time window [start, end)
    const start = new Date(date);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + SLOT_MINUTES);

    // Check if already booked
    const existing = await Reservation.countDocuments({
      table,                                       
      date: { $gte: start, $lt: end },
      status: { $in: ['pending', 'confirmed', 'seated'] }
    });

    if (existing >= PER_TABLE_LIMIT) {
      return res.status(400).json({ message: 'This table is already booked in that time slot' });
    }

    // Create reservation
    const reservation = await Reservation.create({
      customer: req.user._id,
      name: name || req.user.name,
      phone: phone || req.user.phone,
      date,
      partySize,
      table,
      status: 'pending'
    });

    return res.status(201).json(reservation);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const myReservations = async (req, res) => {
  const data = await Reservation
    .find({ customer: req.user._id })
    .sort('-date')
    .populate('table');
  res.json(data);
};
