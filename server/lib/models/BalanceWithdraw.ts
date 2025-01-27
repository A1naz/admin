import { model, Schema } from 'mongoose'
import { User } from './User'

const Model = new Schema({
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  userUuid: { type: String, required: true },
  username: { type: String },
  userPhoneNumber: { type: String },
  userEmail: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, required: true, default: 'created', enum: ['created', 'work', 'cancelled', 'completed', 'error'] },
  date: { type: Date, default: Date.now(), required: true },
  confirmationDate: { type: Date, required: false },
  type: { type: String, required: true, enum: ['INN', 'card'] },
  info: { type: String, required: false },
})

// PartnerWithdrawModel.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.date.setHours(this.date.getHours() + 3);
//   next();
// });

export const BalanceWithdraw = model('BalanceWithdraw', Model)
