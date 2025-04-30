import { Schema, model } from 'mongoose'
import { sutochnoConnection } from '~/server/connections/sutochno'
import { v4 as uuid } from 'uuid'

const ReviewSchema = new Schema({
  article: { type: Number, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  text: { type: String, required: false },
  date: { type: Date, required: true },
  publishDate: { type: Date, required: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  delivery: { type: Schema.Types.ObjectId, ref: 'Delivery', required: true },
  images: { type: Array, required: false },
  status: { type: String, required: true, enum: ['created', 'waiting', 'working', 'published', 'canceled', 'nofunds', 'deleting', 'deleted'] },
  recipientphone: { type: String, required: true },
  videoKey: { type: String, required: false },
  originalVideoName: { type: String, required: false },
  isVideoEnabled: { type: Boolean, required: false },
  createdAt: { type: Date, required: false, default: Date.now },
  uuid: { type: String},
})

export const Review = sutochnoConnection.model('Review', ReviewSchema)

// ReviewSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.date.setHours(this.date.getHours() + 3)
//   next()
// })
