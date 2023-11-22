import { Schema, model } from 'mongoose'
import { User } from './User'
import { paymenthistory } from './Paymenthistory';

const PartnerPaymentHistoryModel = new Schema({
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  paymenthistory: { type: Schema.Types.ObjectId, ref: paymenthistory, required: true },
  serviceID: { type: Schema.Types.ObjectId, required: true },
  referral: { type: Schema.Types.ObjectId, ref: User, required: true },
  refLevel: { type: Number, required: true },
  serviceType: {type: String, required: true},
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
});

export const PartnerPaymentHistory = model('PartnerPaymentHistory', PartnerPaymentHistoryModel)
