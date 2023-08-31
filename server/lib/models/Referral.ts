import { Schema, model } from 'mongoose'
import { User } from './User'

const ReferralModel = new Schema({
  user: { type: Schema.Types.ObjectId, ref: User, required: true, unique: true },
  referrals: [{ type: Schema.Types.ObjectId, ref: User, required: true }],
})

export const Referral = model('Referral', ReferralModel)
