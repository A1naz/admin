import { OzonConnection } from '~/server/connections/ozon'
import { Schema, model } from 'mongoose'
import { Buyout } from '~/server/lib/models/ozon/Buyout'

const BuyoutlogSchema = new Schema({
  date: { type: Date, required: true },
  text: { type: String, required: true, text: true },
  buyout: { type: Schema.Types.ObjectId, ref: Buyout, required: true },
  buyoutuuid: { type: String, required: true },
})

export const Buyoutlog = OzonConnection.model('Buyoutlog', BuyoutlogSchema)
