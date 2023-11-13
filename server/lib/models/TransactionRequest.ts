import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'
import { User } from './User'

const TransactionRequestSchema = new Schema({
  adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
  adminUserUuid: { type: String, required: true },
  summ: { type: Number, required: true },
  transactionNumber: { type: String, required: true },
  client: { type: Schema.Types.ObjectId, ref: User, required: true },
  clientUuid: { type: String, required: true },
  status: { type: String, default: 'created' },
  acception: { type: String, default: '0/2' },
  screenshot: { type: String, required: true },
  transactionDate: { type: Date, required: true },
  phoneNumber: { type: String },
  requestDate: { type: Date, default: new Date() },
})

export const TransactionRequest = model(
  'TransactionRequest',
  TransactionRequestSchema
)
