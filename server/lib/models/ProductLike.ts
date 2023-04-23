import { Schema, model } from 'mongoose'

const ProductLikeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'created' },
  image: { type: String },
  type: { type: String },
  url: { type: String },
  name: { type: String },
  createdDate: { type: Date, default: new Date() },
  period: { type: String, required: true },
  endedDate: { type: Date, default: null },
  progress: { type: Number, default: 0 },
  amount: { type: Number, required: true },
})

export const ProductLike = model('ProductLike', ProductLikeSchema)
