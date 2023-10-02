import { Schema, model } from 'mongoose'
import { User } from './User'

const PartnerWithdrawModel = new Schema({
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  userUuid: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, required: true, default: 'created', enum: ['created', 'work', 'cancelled', 'completed', 'error'] },
  date: { type: Date, default: Date.now(), required: true },
  type: { type: String, required: true, enum: ['card', 'account'] },
  details: { type: Object },
  editDate: { type: Date, default: Date.now() },
})

export const PartnerWithdraw = model('PartnerWithdraw', PartnerWithdrawModel)
