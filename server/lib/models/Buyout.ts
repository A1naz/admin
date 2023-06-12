import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'

const BuyoutSchema = new Schema({
  searchQuery: { type: String, required: true, text: true },
  sizeparam: { type: String, required: true, text: true },
  quantity: { type: Number, required: true, text: true },
  gender: { type: String, required: true, text: true },
  article: { type: Number, required: true, text: true },
  point: { type: String, required: true, text: true },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  product: { type: Object, required: true },
  rules: { type: Array, required: true },
  status: { type: String, required: true, text: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uuid: { type: String, default: uuid() },
  createdAt: { type: Date, default: Date.now },
  place: { type: Number, required: true },
  completed: { type: Number, required: false, default: 0 },
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
  data16: { type: {}, default: '' },
  data17: { type: {}, default: '' },
  data18: { type: {}, default: '' },
})

export const Buyout = model('Buyout', BuyoutSchema)
