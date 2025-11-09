import mongoose from 'mongoose';
const { Schema } = mongoose;

const paymentSchema = new mongoose.Schema({
  order: { type:Schema.Types.ObjectId, ref: 'Order' },
  provider: { type: String, enum: ['stripe','paypal','cod','wallet','other'], default: 'stripe' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending','succeeded','failed','refunded'], default: 'pending' },
  transactionId: { type: String }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
