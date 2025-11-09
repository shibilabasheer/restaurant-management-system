
import Table from '../models/Table.js';
import Reservation from '../models/Reservation.js';

const SLOT_MINUTES = parseInt(process.env.SLOT_MINUTES || '60', 10);
const PER_TABLE_LIMIT = parseInt(process.env.PER_TABLE_LIMIT || '1', 10);

export const listTables = async (_req, res) => {
  const tables = await Table.find().sort('number');
  res.json(tables);
};

export const createTable = async (req, res) => {
  const table = await Table.create(req.body); // { number, seats, isAvailable }
  res.status(201).json(table);
};

export const setAvailability = async (req, res) => {
   try {
       const table = await Table.findById(req.params.id);
       if (!table) return res.status(404).json({ message: 'Not found' });
       table.isAvailable = !table.isAvailable;
       await table.save();
       res.json(table);
     } catch {
       res.status(500).json({ message: 'Server errors' });
     }
};

export const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ message: 'Not found' });
    res.json(table);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ message: 'Table deleted', id: table._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listAvailableTables = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      const all = await Table.find().sort('number');
      return res.json(all);
    }

    const start = new Date(date);
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Invalid date' });
    }
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + SLOT_MINUTES);

    const reserved = await Reservation.find({
      date: { $gte: start, $lt: end },
      status: { $in: ['pending', 'confirmed', 'seated'] },
    }).lean();

    const counts = {};
    for (const r of reserved) {
      const tid = String(r.table);
      counts[tid] = (counts[tid] || 0) + 1;
    }

    const tables = await Table.find().sort('number').lean();
    const available = tables.filter(t => {
      if (!t.isAvailable) return false;
      const c = counts[String(t._id)] || 0;
      return c < PER_TABLE_LIMIT;
    });

    return res.json(available);
  } catch (e) {
    console.error('listAvailableTables error', e);
    return res.status(500).json({ message: 'Server error' });
  }
};
