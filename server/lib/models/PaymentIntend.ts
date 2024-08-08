import { Schema, model } from 'mongoose'

const paymentIntendSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  summ: { type: Number, required: true },
  paymentUuid: { type: String },
  type: { type: String },
  dataoperation: { type: Date },
  comment: { type: String },
  refRewarded: { type: Boolean, default: false },
  mp: { type: String, default: 'wildberries' },
})

export const PaymentIntend = model('paymentIntend', paymentIntendSchema)
