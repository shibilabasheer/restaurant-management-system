import mongoose from 'mongoose';
const { Schema } = mongoose;

const orderItemSchema = new mongoose.Schema({
  menu: { type: Schema.Types.ObjectId, ref: 'Menu' },
  qty: { type: Number, default: 1 },
  price: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, index: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
  items: { type: [orderItemSchema], default: [] },
  type: { type: String, enum: ['dinein','takeaway','delivery'], default: 'dinein' },
  table: { type: Schema.Types.ObjectId, ref: 'Table' },      // table ref for dinein
  deliveryAddress: {
    building : String,
    street: String,
    city: String,
    zipcode: String
  },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['received','preparing','ready','out-for-delivery','delivered','cancelled','refunded','paid'], default: 'received' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
