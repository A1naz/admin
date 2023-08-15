import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'

const AutoanswerModel = new Schema({
  article: { type: String, required: true, text: true },
  product: { type: Object, required: true },
  text: { type: String, required: true },
  ratingFilterFrom: { type: Number, min: 0, max: 5, required: true },
  ratingFilterTo: { type: Number, min: 0, max: 5, required: true },
  status: { type: String, required: true, text: true, enum: ['work', 'stopped', 'error', 'created'], default: 'created' },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wbApiKey: { type: String, required: true },
  uuid: { type: String, default: uuid() },
  createdAt: { type: Date, default: Date.now },
  payed: { type: Boolean, default: false },
  expiryDate: { type: Date, required: false, default: Date.now },
})

export const Autoanswer = model('Autoanswer', AutoanswerModel)
