import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'

const TariffPaymentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uuid: { type: String, required: true },
  mp: { type: String, required: true },
  login: { type: String, default: '' },
  tariff: { type: String, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: new Date(Date.now()) },
  status: { type: String, default: 'created' },
  screenshot: { type: String },
})

export const TariffPayment = model('TariffPayment', TariffPaymentSchema)
