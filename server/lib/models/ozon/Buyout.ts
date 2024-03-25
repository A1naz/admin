import { Schema, model } from 'mongoose'
import { OzonConnection } from '~/server/connections/ozon'
import { v4 as uuid } from 'uuid'
import { User } from '../User'

const ProductSchema = new Schema({
  name: { type: String, required: true, text: true },
  price: { type: String, required: true },
  priceText: { type: String, required: true },
  image: { type: String, required: true },
})
const BuyoutSchema = new Schema({
  searchQuery: { type: String, text: true, default: '' },
  sizeparam: { type: String, required: true, text: true },
  quantity: { type: Number, required: true, text: true, max: 50 },
  gender: { type: String, required: true, text: true },
  article: { type: Number, required: true, text: true },
  point: { type: String, required: true, text: true },
  pointId: { type: Number },
  pointCoordinates: { type: Object, required: false },
  point_city: { type: String, required: false },
  point_state: { type: String, required: false },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  product: { type: ProductSchema, required: true },
  rules: { type: Array, required: true },
  status: {
    type: String,
    required: true,
    text: true,
    enum: [
      'completed',
      'created',
      'archived',
      'active',
      'work',
      'paused',
      'nofunds',
    ],
  },
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  uuid: { type: String, default: uuid() },
  createdAt: { type: Date, default: Date.now },
  place: { type: Number, required: true },
  purchaseSoon: { type: Boolean, required: false, default: false },
  completed: { type: Number, required: false, default: 0 },
  discount: { type: String, required: false, default: 0 },
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

export const Buyout = OzonConnection.model('Buyout', BuyoutSchema)
