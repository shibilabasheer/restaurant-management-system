
import Cart from '../models/Cart.js';
import Menu from '../models/Menu.js';

export const getMyCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json(cart);
};

export const updateItem = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { qty } = req.body;

    if (!qty || qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const menuItem = await Menu.findOne({ _id: menuId, isActive: true });
    if (!menuItem) {
      return res.status(400).json({ message: 'Menu item not found or inactive' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(i => i.menu.toString() === menuId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.qty = qty;

    await cart.save();
    res.json({ message: 'Cart item updated', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addItem = async (req, res) => {
  try {
    const { menu, qty = 1 } = req.body;

    if (!menu) {
      return res.status(400).json({ message: 'Menu ID is required' });
    }

    const menuItem = await Menu.findById(menu);

    if (!menuItem || !menuItem.isActive) {
      return res.status(400).json({ message: 'Menu item not found or inactive' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] ,type:req.type});
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.menu.toString() === menu);

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({
        menu: menuItem._id,
        name: menuItem.name,
        qty,
        price: menuItem.price
      });
    }

    await cart.save();

    res.json(cart);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeItem = async (req, res) => {
  const { menuId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const beforeCount = cart.items.length;
  cart.items = cart.items.filter(item => item.menu.toString() !== menuId);
  const afterCount = cart.items.length;

  if (beforeCount === afterCount)
    return res.status(404).json({ message: 'Item not found in cart' });

  await cart.save();
  res.json({ message: 'Item removed', cart });
};


export const clearCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.json({ items: [] });
  cart.items = [];
  await cart.save();
  res.json(cart);
};
