import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'

const TariffPlanSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
  mp: { type: String, required: true },
  tariff: { type: String, required: true },
  type: { type: String, required: true },
  timeLimitMonths: { type: Number, required: true },
  endDate: { type: Date, required: true },
  activationDate: { type: Date, required: true },
  paymentDate: { type: Date, required: true },

})

export const TariffPlan = model('TariffPlan', TariffPlanSchema)
