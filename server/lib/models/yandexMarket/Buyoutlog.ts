import { yandexConnection } from '~/server/connections/yandexMarket'
import { Schema, model } from 'mongoose'
import { Buyout } from '~/server/lib/models/yandexMarket/Buyout'

const BuyoutlogSchema = new Schema({
  date: { type: Date, required: true },
  text: { type: String, required: true, text: true },
  buyout: { type: Schema.Types.ObjectId, ref: Buyout, required: true },
  buyoutuuid: { type: String, required: true },
})

export const Buyoutlog = yandexConnection.model('Buyoutlog', BuyoutlogSchema)
