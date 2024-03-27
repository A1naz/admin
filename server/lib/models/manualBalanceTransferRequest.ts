import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'
import { User } from './User'

const manualBalanceTransferRequestSchema = new Schema({
  summ: { type: Number, required: true },
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  operationNumber: { type: String, required: true },
  userUuid: { type: String, required: true },
  status: { type: String, default: 'created' },
  acception: { type: String, default: '0/2' },
  screenshot: { type: String, required: true },
  operationDate: { type: Date, default: new Date() },
  createdAt: { type: Date, default: new Date() },
  clientPC: { type: Boolean, default: false },
  bank: { type: String, default: '' },
})

export const manualBalanceTransferRequest = model(
  'manualBalanceTransferRequest',
  manualBalanceTransferRequestSchema
)
