// server/routes/payment.js
import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { protect } from "../middlewares/auth.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Payment from '../models/Payment.js';

const router = express.Router();

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    console.error('Razorpay keys missing. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in server .env');
    return null;
  }
  return new Razorpay({ key_id, key_secret });
}

router.post("/razorpay/create", protect, async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) return res.status(500).json({ message: 'Payment provider not configured (server env missing)' });

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.menu");
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
    const tax = +(subtotal * 0.05).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    const options = {
      amount: Math.round(total * 100), // paise as integer
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: req.user._id.toString() },
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Razorpay create error:", err);
    return res.status(500).json({ message: "Payment order creation failed" });
  }
});

router.post("/razorpay/verify", protect, async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing verification payload' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      console.error('RAZORPAY_KEY_SECRET missing');
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto.createHmac("sha256", key_secret)
                                    .update(body.toString())
                                    .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.menu");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const subtotal = cart.items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0), 0);
    const tax = +(subtotal * 0.05).toFixed(2);
    const totalAmount = +(subtotal + tax).toFixed(2);

    const orderDoc = await Order.create({
      orderNumber: "ORD-" + Date.now(),
      customer: req.user._id,
      items: cart.items.map(i => ({
        menu: i.menu && (i.menu._id || i.menu),
        qty: i.qty,
        price: i.price
      })),
      type: "delivery",
      subtotal,
      tax,
      deliveryFee: 0,
      totalAmount,
      payment: undefined,
      status: 'paid',
    });

    const paymentDoc = await Payment.create({
      order: orderDoc._id,
      provider: 'razorpay',
      amount: totalAmount,
      status: 'succeeded',
      transactionId: razorpayPaymentId,
    });

    orderDoc.payment = paymentDoc._id;
    await orderDoc.save();

    cart.items = [];
    await cart.save();

    const populated = await Order.findById(orderDoc._id)
      .populate('customer', 'name email')
      .populate('items.menu', 'name image price')
      .populate('table', 'number seats')
      .populate('payment')
      .lean();

    return res.json({ success: true, order: populated, payment: paymentDoc });
  } catch (err) {
    console.error("Razorpay verify error:", err);
    return res.status(500).json({ message: "Payment verification failed" });
  }
});


export default router;
