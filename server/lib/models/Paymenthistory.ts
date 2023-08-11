import { Schema, model } from 'mongoose'

const paymenthistorySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  summ: { type: String, required: true },
  type: { type: String },
  article: { type: String },
  typeoperations: { type: String },
  basisoperation: { type: String },
  dataoperation: { type: Date },
  comment: { type: String },
})

export const paymenthistory = model('paymenthistory', paymenthistorySchema)
