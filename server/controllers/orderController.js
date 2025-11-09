import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import User from '../models/User.js';

export const createOrder = async (req, res) => {
  
  try {
   
    const { deliveryAddress, tableNumber: tableNumberFromBody, reservationId, markSeated } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    let orderType = cart.type || 'dinein';
    let tableRef = undefined;
    let reservation = null;

    if (reservationId) {
      reservation = await Reservation.findById(reservationId).populate('table');
      if (!reservation) return res.status(400).json({ message: 'Invalid reservation' });

      const isOwner = reservation.customer?.toString() === req.user._id.toString();
      const isStaff = ['admin', 'staff'].includes(req.user.role);
      if (!isOwner && !isStaff) return res.status(403).json({ message: 'Forbidden to use this reservation' });

      if (!['pending', 'confirmed'].includes(reservation.status)) {
        return res.status(400).json({ message: `Reservation status "${reservation.status}" cannot be used for ordering` });
      }

      tableRef = reservation.table?._id || reservation.table;
      orderType = 'dinein';
    } else if (tableNumberFromBody) {

      const tbl = await Table.findById(tableNumberFromBody);
      if (!tbl) return res.status(400).json({ message: 'Invalid table' });
      tableRef = tbl._id;
      orderType = 'dinein';
    }

    const subtotal = cart.items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0), 0);
    const tax = +(subtotal * 0.05).toFixed(2); // 5% example
    const deliveryFee = orderType === 'delivery' ? 50 : 0;
    const totalAmount = +(subtotal + tax + deliveryFee).toFixed(2);

    const orderDoc = {
      orderNumber: 'ORD-' + Date.now(),
      customer: req.user._id,
      items: cart.items.map(i => ({
        menu: i.menu && (i.menu._id || i.menu),
        qty: i.qty,
        price: i.price
      })),
      type: orderType,
      table: tableRef || undefined,
      deliveryAddress: deliveryAddress || undefined,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      status: 'received',
    };

    const saved = await Order.create(orderDoc);

    cart.items = [];
    await cart.save();

    if (reservation && markSeated) {
      reservation.status = 'seated';
      await reservation.save();
    }

    const populated = await Order.findById(saved._id)
      .populate('customer', 'name email')
      .populate('table', 'number seats')    
      .populate('items.menu', 'name image price')
      .lean();

    return res.status(201).json({ message: 'Order placed successfully', order: populated });
  } catch (e) {
    console.error('createOrder error:', e);
    return res.status(500).json({ message: e.message});
  }
};

/**
 * Get a single order by id 
 */
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('table', 'number seats')
      .populate('items.menu', 'name image price')
      .populate('payment');

    if (!order) return res.status(404).json({ message: 'Not found' });

    const isOwner = order.customer?._id?.toString() === req.user._id.toString();
    const isStaff = ['admin', 'staff'].includes(req.user.role);
    if (!isOwner && !isStaff) return res.status(403).json({ message: 'Forbidden' });

    res.json(order);
  } catch (e) {
    console.error('getOrder error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update order status (staff/admin or owner depending on rules)
 * Body: { status: 'preparing' } etc.
 */
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['received','preparing','ready','out-for-delivery','delivered','cancelled','refunded'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });

    const isStaff = ['admin', 'staff'].includes(req.user.role);
    const isOwner = order.customer?.toString() === req.user._id.toString();
    if (!isStaff && !isOwner) return res.status(403).json({ message: 'Forbidden' });

    order.status = status;
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('table', 'number seats')
      .populate('items.menu', 'name image price');

    res.json(populated);
  } catch (e) {
    console.error('updateStatus error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * List orders belonging to current user
 */
export const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort('-createdAt')
      .populate('items.menu', 'name image price')
      .populate('table', 'number seats')
      .lean();
    res.json(orders);
  } catch (e) {
    console.error('myOrders error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Admin/staff listing with filters, pagination, full populate
 * Query params supported: page, limit, status, type, customer, q, from, to, sort
 */
export const listAllOrders = async (req, res) => {
  try {
    // only staff/admin
    const isStaff = ['admin','staff'].includes(req.user.role);
    if (!isStaff) return res.status(403).json({ message: 'Forbidden' });

    const {
      page = 1,
      limit = 10,
      status,
      type,
      customer,
      q,
      from,
      to,
      sort = '-createdAt',
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    if (from || to) {
      filters.createdAt = {};
      if (from) filters.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        if (!to.includes('T')) toDate.setHours(23, 59, 59, 999);
        filters.createdAt.$lte = toDate;
      }
    }

    if (customer) {
      filters.customer = customer;
    }

    if (q && !customer) {
      const rx = new RegExp(q, 'i');
      const users = await User.find({ $or: [{ name: rx }, { email: rx }] }, { _id: 1 }).lean();
      const ids = users.map(u => u._id);
      if (ids.length === 0) {
        return res.json({
          data: [],
          meta: { page: Number(page), limit: Number(limit), total: 0, pages: 0 },
        });
      }
      filters.customer = { $in: ids };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      Order.find(filters)
        .populate('customer', 'name email')
        .populate('table', 'number seats')
        .populate('items.menu', 'name image price')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filters),
    ]);

    return res.json({
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 0,
      },
    });
  } catch (e) {
    console.error('listAllOrders error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

