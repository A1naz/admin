import { Schema, model } from 'mongoose'
import { zyConnection } from '~/server/connections/zy'

import { v4 as uuid } from 'uuid'

const ReviewSchema = new Schema({
  article: { type: Number, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  text: { type: String, required: false },
  date: { type: Date, required: true },
  positive: { type: String, default: '' },
  negative: { type: String, default: '' },
  publishDate: { type: Date, required: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  delivery: { type: Schema.Types.ObjectId, ref: 'Delivery', required: true },
  idDelivery: { type: String },
  images: { type: Array, required: false },
  status: {
    type: String,
    required: true,
    enum: [
      'created',
      'waiting',
      'working',
      'published',
      'canceled',
      'nofunds',
      'deleting',
      'deleted',
    ],
  },
  recipientphone: { type: String, required: true },
  createdAt: { type: Date, required: false, default: Date.now },
  uuid: { type: String, default: uuid() },
})

export const Review = zyConnection.model('Review', ReviewSchema)

// ReviewSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.date.setHours(this.date.getHours() + 3)
//   next()
// })
