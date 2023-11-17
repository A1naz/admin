import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'
import { User } from './User'

const balanceTransferRequestSchema = new Schema({
  adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
  adminUserUuid: { type: String, required: true },
  adminUserUsername: { type: String },
  summ: { type: Number, required: true },
  sender: { type: Schema.Types.ObjectId, ref: User, required: true },
  senderUUID: { type: String, required: true },
  senderUsername: { type: String },
  recipient: { type: Schema.Types.ObjectId, ref: User, required: true },
  recipientUUID: { type: String, required: true },
  recipientUsername: { type: String },
  status: { type: String, default: 'created' },
  acception: { type: String, default: '0/2' },
  screenshot: { type: String, required: true },
  requestDate: { type: Date, default: new Date() },
})

export const balanceTransferRequest = model(
  'balanceTransferRequest',
  balanceTransferRequestSchema
)
