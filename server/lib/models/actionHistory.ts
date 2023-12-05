import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'

const ActionHistoryModel = new Schema({
  adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
  adminUserUuid: { type: String },
  actionId: { type: Number, required: true },
  actionDescription: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
  userUuid: { type: String },
})

ActionHistoryModel.pre('save', function (next) {
  // Добавляем 3 часа к полю "date"
  this.date.setHours(this.date.getHours() + 3);
  next();
});

export const ActionHistory = model('ActionHistory', ActionHistoryModel)
