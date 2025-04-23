import { Schema, model } from 'mongoose'
import { yandexConnection } from '~/server/connections/yandexMarket'
import { v4 as uuid } from 'uuid'

const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'created' },
  query: { type: String, required: true },
  article: { type: String, required: true },
  amount: { type: Number, required: true },
  period: { type: String, required: true },
  name: { type: String },
  image: { type: String },
  size: { type: String, required: true },
  createdDate: { type: Date, default: new Date() },
  endedDate: { type: Date },
  uuid: {type: String},
})

// CartSchema.pre('save', function (next) {
//   this.createdDate.setHours(this.createdDate.getHours() + 3);
//   next();
// });

export const Cart = yandexConnection.model('Cart', CartSchema)
