import { Schema, model } from 'mongoose'

const TariffPaymentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uuid: { type: String, required: true },
  mp: { type: String, required: true },
  login: { type: String, default: '' },
  orgName: { type: String, default: '' },
  tariff: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, default: 0 },
  createdAt: { type: Date, default: new Date(Date.now()) },
  months: { type: Number, default: 1 },
  status: { type: String, default: 'created' },
})

export const TariffPayment = model('TariffPayment', TariffPaymentSchema)
