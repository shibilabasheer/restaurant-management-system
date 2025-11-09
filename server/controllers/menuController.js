import Menu from '../models/Menu.js';

export const listMenu = async (_req, res) => {
  try {
    const items = await Menu.find({ isActive: true }).sort('category name');
    res.json(items);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMenu = async (req, res) => {
  try {
    const item = await Menu.create(req.body);
    res.status(201).json(item);
  } catch  (e) {
    console.error("Update menu error:", e);    
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const item = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    console.error("Update menu error:", e);    
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const toggleActive = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    item.isActive = !item.isActive;
    await item.save();
    res.json(item);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item deleted', id: menu._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};


