import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true, text: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, unique: false, required: false },
  password: { type: String, required: false },
  uuid: { type: String, unique: true, required: true, default: uuid() },
  roles: [{ type: String, ref: 'Role' }],
  emailConfirmed: { type: Boolean, default: false },
  telegram: { type: String, required: false },
  telegramUserId: { type: String, required: false },
  telegramUnlinkEmailSend: { type: Date, required: false },
  balance: { type: Number, default: 0, required: true },
  registrationDate: { type: Date, default: Date.now },
})

export const User = model('User', UserSchema)
