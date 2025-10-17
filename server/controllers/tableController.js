
import Table from '../models/Table.js';

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
