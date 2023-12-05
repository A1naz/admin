import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { Tariff } from './Tariff'

const partnerSchema = new Schema({
  balance: { type: Number, default: 0 },
  refCount: { type: Number, default: 0 },
  rewardPercent: { type: Number, default: 10 },
})

const UserSchema = new Schema({
  isBanned: { type: Boolean, default: false },
  username: { type: String, unique: true, required: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, unique: false, required: false },
  wbApiKey: { type: String, required: false },
  wbApiKeys: { type: Array, required: false },
  password: { type: String, required: false },
  uuid: { type: String, unique: true, required: true, default: uuid() },
  currentCabinet: { type: Schema.Types.ObjectId },

  uuidCompany: { type: String, unique: false },
  acesses: [{ type: String, required: false }],

  roles: [{ type: String, ref: 'Role' }],
  tariff: {
    type: Tariff.schema,
    required: true,
    default: {
      buyouts: {
        type: 'price',
        value: 100,
      },
      deliveryStorage: {
        type: 'price',
        value: 25,
      },
      review: {
        type: 'price',
        value: 40,
      },
      likeReview: {
        type: 'price',
        value: 5,
      },
      likeProduct: {
        type: 'price',
        value: 5,
      },
      questionProduct: {
        type: 'price',
        value: 7,
      },
      cart: {
        type: 'price',
        value: 5,
      },
      autoAnswer: {
        type: 'price',
        value: 100,
      },
    },
  },

  tabs: [{ type: String }],
  newEmail: { type: String, required: false },
  emailConfirmed: { type: Boolean, default: false },
  telegram: { type: String, required: false },
  telegramUserId: { type: String, required: false },
  telegramUnlinkEmailSend: { type: Date, required: false },
  tg2fa: { type: Boolean, required: false, default: false },
  balance: { type: Number, default: 0, required: true },
  registrationDate: { type: Date, default: Date.now },
  partner: {
    type: partnerSchema,
    ref: 'Partner',
    default: {
      balance: 0,
      refCount: 0,
      rewardPercent: 10,
    },
  },
})

UserSchema.pre('save', function (next) {
  // Добавляем 3 часа к полю "date"
  this.registrationDate.setHours(this.registrationDate.getHours() + 3)
  next()
})

export const User = model('User', UserSchema)
