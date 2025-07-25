import { model, Schema } from 'mongoose'

const ConfirmPhoneSchema = new Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  date: { type: Date, required: true },
  count: { type: Number, default: 1 },
  errorCount: { type: Number, default: 0 },
})

export const ConfirmPhone = model('confirmPhone', ConfirmPhoneSchema)
