import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'

const ActionHistoryModel = new Schema({
  adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
  actionId: { type: Number, required: true },
  actionDescription: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
})

export const ActionHistory = model('ActionHistory', ActionHistoryModel)
