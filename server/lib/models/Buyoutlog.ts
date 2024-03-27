import { Schema, model } from 'mongoose'
import { Buyout } from './Buyout'
import { wildberriesConnection } from '~/server/connections/wildberries'

const BuyoutlogSchema = new Schema({
  date: { type: Date, required: true },
  text: { type: String, required: true, text: true },
  buyout: { type: Schema.Types.ObjectId, ref: Buyout, required: true },
  buyoutuuid: { type: String, required: true },
})

export const Buyoutlog = wildberriesConnection.model('Buyoutlog', BuyoutlogSchema)
