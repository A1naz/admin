import { Schema, model } from 'mongoose'
import { OzonConnection } from '~/server/connections/ozon'

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

ProductLikeSchema.pre('save', function (next) {
  // Добавляем 3 часа к полю "date"
  this.createdDate.setHours(this.createdDate.getHours() + 3)
  next()
})

export const ProductLike = OzonConnection.model('ProductLike', ProductLikeSchema)
