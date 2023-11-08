import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'

const TransactionRequestSchema = new Schema({
  adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
  transaction: { type: String, required: true },
  transactionNumber: { type: String, required: true },
  client: { type: String, required: true },
  status: { type: String, default: 'created' },
  sum: { type: Number, default: 0 },
  acception: { type: String, default: '0/2' },
  screenshot: { type: String, required: true },
  requestDate: { type: Date, default: new Date() },
})

export const TransactionRequest = model(
  'TransactionRequest',
  TransactionRequestSchema
)
