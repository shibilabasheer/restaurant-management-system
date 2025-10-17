import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  number: { type: String, required: true },
  seats: { type: String , default:4},
  isAvailable: { type: Boolean, default: true }
},{timestamps : true});

export default mongoose.model("Table", tableSchema);