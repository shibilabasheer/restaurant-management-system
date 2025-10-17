import mongoose from 'mongoose';
const { Schema } = mongoose;

const cartItemSchema = new mongoose.Schema({
  menu: { type: Schema.Types.ObjectId, ref: 'Menu' , required: true },
  name: { type: String ,  required: true},
  qty: { type: Number ,  default: 1},
  price: { type: Number ,  required: true},
},{_id : false});

const cartSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' , required: true },
  items: { type: [cartItemSchema] ,  default: []},
  type: { type: String, enum: ['dinein','takeaway','delivery'], default: 'dinein' }
},{timestamps : true});

export default mongoose.model("Cart", cartSchema);