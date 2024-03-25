import { Schema, model } from 'mongoose'
import { wildberriesConnection } from '~/server/connections/wildberries'

const DeliverySchema = new Schema({
  article: { type: String, required: true, text: true },
  pricebuy: { type: Number, required: true },
  point: { type: String, required: true },
  point_city: { type: String, required: false },
  point_state: { type: String, required: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  idbuyout: {
    type: Schema.Types.ObjectId,
    ref: 'Buyout',
    required: true,
    unique: false,
  },
  uuidbuyout: { type: String, required: true },
  statusdelivery: { type: Array, required: true },
  receiptcode: { type: String, required: false },
  receiptcodeqr: { type: String, required: false },
  recipient: { type: String, required: false },
  recipientphone: { type: String, required: false },
  status: { type: String, required: true },
  updatedAt: { type: Date, required: true, default: new Date() },
  reviewed: { type: Boolean, required: true, default: false },
  data5: { type: {}, default: '' },
  data6: { type: {}, default: '' },
  data7: { type: {}, default: '' },
  data8: { type: {}, default: '' },
  data9: { type: {}, default: '' },
  data10: { type: {}, default: '' },
  data11: { type: {}, default: '' },
  data12: { type: {}, default: '' },
  data13: { type: {}, default: '' },
  data14: { type: {}, default: '' },
  data15: { type: {}, default: '' },
})

DeliverySchema.pre('save', function (next) {
  // Добавляем 3 часа к полю "date"
  this.updatedAt.setHours(this.updatedAt.getHours() + 3);
  next();
});

export const Delivery = wildberriesConnection.model('Delivery', DeliverySchema)
