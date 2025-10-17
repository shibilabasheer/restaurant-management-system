
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  try {

    const { deliveryAddress, tableNumber} = req.body;   
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.menu');
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const tax = subtotal * 0.05; // 5% GST
    const deliveryFee = cart.type === 'delivery' ? 50 : 0;
    const totalAmount = subtotal + tax + deliveryFee;

    const order = await Order.create({
      orderNumber: 'ORD-' + Date.now(),
      customer: req.user._id,
      items: cart.items.map(i => ({
        menu: i.menu,
        qty: i.qty,
        price: i.price
      })),
      type: cart.type,
      totalAmount,
      subtotal,
      tax,
      deliveryFee,
      status: 'received',
      tableNumber: tableNumber || undefined,
      deliveryAddress: deliveryAddress || undefined,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  const isOwner = order.customer?.toString() === req.user._id.toString();
  const isStaff = ['admin','staff'].includes(req.user.role);
  if (!isOwner && !isStaff) return res.status(403).json({ message: 'Forbidden' });
  res.json(order);
};

export const updateStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['received','preparing','ready','out-for-delivery','delivered','cancelled','refunded'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  order.status = status;
  await order.save();
  res.json(order);
};

export const myOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort('-createdAt');
  res.json(orders);
};
