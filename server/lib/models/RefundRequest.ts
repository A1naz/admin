import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'
import { User } from './User'

const RefundRequestSchema = new Schema({
  adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
  adminUserUuid: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  screenshot: { type: String, required: true },
  mainOperation: { type: Schema.Types.ObjectId, required: true },
  selectedPaymentOperations: [{ type: Schema.Types.ObjectId, required: true }],
  mainOperationSumm: { type: Number, required: true },
  selectedPaymentOperationsSumm: { type: Number, required: true },
  status: { type: String, default: 'created' },
  acception: { type: String, default: '0/2' },
  requestDate: { type: Date, default: new Date() },

})

export const RefundRequest = model(
  'RefundRequest',
  RefundRequestSchema
)
