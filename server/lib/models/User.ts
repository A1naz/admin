import { Schema, model } from 'mongoose'
const UserSchema = new Schema({
  username: { type: String, unique: false, required: false, text: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  uuid: { type: String, unique: true, required: true },
  roles: [{ type: String, ref: 'Role' }],
  emailConfirmed: { type: Boolean, default: false },
  registrationDate: { type: Date, default: Date.now },
})

export const User = model('User', UserSchema)
