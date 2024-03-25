import { Schema, model } from 'mongoose'
import { OzonConnection } from '~/server/connections/ozon'

const ReviewSchema = new Schema({
  article: { type: Number, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  text: { type: String, required: false },
  date: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  delivery: { type: Schema.Types.ObjectId, ref: 'Delivery', required: true },
  images: { type: Array, required: false },
  status: { type: String, required: true, enum: ['created', 'waiting', 'working', 'published', 'canceled', 'nofunds', 'deleting', 'deleted'] },
  recipientphone: { type: String, required: true },
})

export const Review = OzonConnection.model('Review', ReviewSchema)

// ReviewSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.date.setHours(this.date.getHours() + 3);
//   next();
// });