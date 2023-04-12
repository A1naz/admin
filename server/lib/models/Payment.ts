import { Schema, model } from 'mongoose'

const PaymentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: new Date() },
  status: { type: String, required: true },
  details: {
    type: Object,
    required: false,
    default: {
      url: null,
      transferCard: null,
      transferSum: null,
    },
  },
  type: { type: Number, required: true },
})

export const Payment = model('Payment', PaymentSchema)
