import { Schema, model } from 'mongoose'
import { User } from './User'

const PartnerPaymentHistoryModel = new Schema({
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
})

export const PartnerPaymentHistory = model('PartnerPaymentHistory', PartnerPaymentHistoryModel)
