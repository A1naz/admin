import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'

const partnerSchema = new Schema({
  balance: { type: Number, default: 0 },
  refCount: { type: Number, default: 0 },
  rewardPercent: { type: Number, default: 10 },
})
const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, unique: false, required: false },
  wbApiKey: { type: String, required: false },
  wbApiKeys: { type: Array, required: false },
  password: { type: String, required: false },
  uuid: { type: String, unique: true, required: true, default: uuid() },
  roles: [{ type: String, ref: 'Role' }],
  emailConfirmed: { type: Boolean, default: false },
  telegram: { type: String, required: false },
  telegramUserId: { type: String, required: false },
  telegramUnlinkEmailSend: { type: Date, required: false },
  tg2fa: { type: Boolean, required: false, default: false },
  balance: { type: Number, default: 0, required: true },
  registrationDate: { type: Date, default: Date.now },
  tabs: [{ type: String }],
  mainAdmin: { type: Boolean },
  partner: {
    type: partnerSchema,
    ref: 'Partner',
    default: {
      balance: 0,
      refCount: 0,
      rewardPercent: 0,
    },
  },
  allowedUsers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  isAllUsersAllowed: { type: Boolean, default: false },
})

export const AdminUser = model('AdminUser', UserSchema)
