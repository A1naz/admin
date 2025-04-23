import { Schema, model } from 'mongoose'
import { AvitoConnection } from '~/server/connections/avito'
import { v4 as uuid } from 'uuid'

const ReviewSchema = new Schema({
  article: { type: Number, required: true },
  name: { type: String, required: true },
  conformityRating: { type: Number, required: true },
  valuePerMoneyRating: { type: Number, required: true },
  serviceRating: { type: Number, required: true },
  deliveryRating: { type: Number, required: true },
  publicComment: { type: String, required: false },
  hiddenComment: { type: String, required: false },
  date: { type: Date, required: true },
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
  // videoKey: { type: String, required: false },
  // originalVideoName: { type: String, required: false },
  isVideoEnabled: { type: Boolean, required: false },
  createdAt: { type: Date, required: false, default: Date.now },
  uuid: { type: String, default: uuid() },
})

export const Review = AvitoConnection.model('Review', ReviewSchema)

// ReviewSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.date.setHours(this.date.getHours() + 3)
//   next()
// })
