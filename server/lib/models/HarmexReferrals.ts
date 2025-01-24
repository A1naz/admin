import { model, Schema } from 'mongoose'
import { User } from './User'

const ref = new Schema({
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  date: { type: Date, default: new Date(), required: true },
  isShared: { type: Boolean, default: false, required: true },
})
const ReferralModel = new Schema({
  user: { type: Schema.Types.ObjectId, ref: User, required: true, unique: true },
  rewardPercent: { type: Number, default: 5 },
  partnerServiceRewardSum: { type: Number, default: 500 },
  partnerRewardType: { type: String, default: 'service' },
  referrals: [ref],
})

export const HarmexReferrals = model('HarmexReferrals', ReferralModel)
