import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer','admin','staff'], default: 'customer' },
  address: {
    street: String,
    city: String,
    zipcode: String
  },
  isActive:{ type:Boolean , default:true},
},{timestamps : true});

export default mongoose.model("User", userSchema);
