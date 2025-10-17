import mongoose from 'mongoose';
const { Schema } = mongoose;

const reservationSchema = new mongoose.Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User' , required: true },
  name: { type:String},
  phone:{ type:String},
  date: { type: Date, required: true },
  partySize: { type: Number, required: true },
  table:  { type: Schema.Types.ObjectId, ref: 'Table' , required: true },
  status: { type: String, enum: ['pending','confirmed','seated','completed','cancelled'], default: 'pending' }
},{timestamps : true});

export default mongoose.model("Reservation", reservationSchema);
