import { Schema, model } from 'mongoose'

const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'created' },
  query: { type: String, required: true },
  article: { type: String, required: true },
  amount: { type: Number, required: true },
  period: { type: String, required: true },
  name: { type: String },
  image: { type: String },
  size: { type: String, required: true },
  createdDate: { type: Date, default: new Date(Date.now()) },
  endedDate: { type: Date },
})

export const Cart = model('Cart', CartSchema)
