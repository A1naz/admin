import { Schema, model } from 'mongoose'
import { User } from './User'

const ref = new Schema({
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  date: { type: Date, default: new Date(), required: true },
})
const ReferralModel = new Schema({
  user: { type: Schema.Types.ObjectId, ref: User, required: true, unique: true },
  referrals: [ref],
})

export const Referral = model('Referral', ReferralModel)
