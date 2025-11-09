import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String},
  price: { type: Number, required: true },
  category: { type: String},
  image: { type: String},
  isActive: { type: Boolean, default: true },
  isToppick: { type: Boolean, default: false }
},{timestamps : true});

export default mongoose.model("Menu", menuSchema);
