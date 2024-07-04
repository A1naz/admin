import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'

const TariffPlanSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
  uuid: { type: String, required: true },
  mp: { type: String, required: true },
  tariff: { type: String, required: true },
  type: { type: String, required: true },
  timeLimitMonths: { type: Number, required: true },
  endDate: { type: Date, required: true },
  activationDate: { type: Date, required: true },
  createdAt: { type: Date, default: new Date(Date.now()) },
  paymentDate: { type: Date, required: true },
  status: { type: String, default: 'На рассмотрении' },
  screenshot: { type: String },
})

export const TariffPlan = model('TariffPlan', TariffPlanSchema)
