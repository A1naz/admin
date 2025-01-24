import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { IUser } from '@/data/types'
import { Tariff } from './Tariff'

interface IUserSchema extends IUser, Document {}

const partnerSchema = new Schema({
  balance: { type: Number, default: 0 },
  refCount: { type: Number, default: 0 },
  rewardPercent: { type: Number, default: 5 },
  followCount: { type: Number, default: 0 },
  secondLevelPercent: { type: Number, default: 2 },
  partnerServiceRewardSum: { type: Number, default: 500 },
  partnerRewardType: { type: String, default: 'service' },
})

const UserSchema = new Schema({
  orgKey: { type: String },
  orgName: { type: String },
  orgOgrn: { type: String },
  orgInn: { type: String, required: false, unique: true },
  middleName: { type: String },
  phoneNumber: { type: String },

  bankInfo: { type: Object, required: false },
  rs: { type: String },
  bik: { type: String },

  isBanned: { type: Boolean, default: false },
  username: { type: String, unique: true, required: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, unique: false, required: false },
  apiKeys: [
    {
      mp: { type: String, required: true },
      keys: { type: [String], required: false },
    },
  ],
  wbApiKey: { type: String, required: false },
  wbApiKeys: { type: [String], required: false },
  password: { type: String, required: false },
  uuid: { type: String, unique: true, required: true, default: uuid() },

  uuidCompany: { type: String, unique: false },
  acesses: [{ type: String, required: false }],

  roles: [{ type: String, ref: 'Role' }],
  tariff: { type: Tariff.schema },
  MPTariffs: [
    {
      mp: { type: String },
      prices: { type: Tariff.schema, required: true },
    },
  ],
  twoFaQR: { type: String, required: false },
  twoFaSecret: { type: String, required: false },
  isTwoFaEnabled: { type: Boolean, default: false },

  terminateSession: { type: Boolean, default: false },

  tabs: [{ type: String }],
  newEmail: { type: String, required: false },
  emailConfirmed: { type: Boolean, default: false },
  telegram: { type: String, required: false },
  telegramUserId: { type: String, required: false },
  telegramUnlinkEmailSend: { type: Date, required: false },
  tg2fa: { type: Boolean, required: false, default: false },
  balance: { type: Number, default: 0, required: true },
  tariffBalance: { type: Number },
  registrationDate: { type: Date, default: Date.now },
  post: { type: 'String' },
  newPassword: { type: String },
  landing: { type: String },
  ffEnabled: { type: Boolean, default: false },
  partner: {
    type: partnerSchema,
    ref: 'Partner',
    default: {
      balance: 0,
      refCount: 0,
      rewardPercent: 5,
      secondLevelPercent: 2,
      followCount: 0,
    },
  },
  fizFace: { type: Boolean, default: false },
  isDocSigned: { type: Boolean, default: false },

  votedFor: { type: [String], default: [] },
  votedForService: { type: [Object], default: [] },
})

// UserSchema.pre('save', function (next) {
//   // Добавляем 3 часа к полю "date"
//   this.registrationDate.setHours(this.registrationDate.getHours() + 3)
//   next()
// })

export const User = model<IUserSchema>('User', UserSchema)
