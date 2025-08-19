import { zyConnection } from '~/server/connections/zy'

import { Schema, model } from 'mongoose'
import { Buyout } from '~/server/lib/models/zy/Buyout'

const BuyoutlogSchema = new Schema({
  date: { type: Date, required: true },
  text: { type: String, required: true, text: true },
  buyout: { type: Schema.Types.ObjectId, ref: Buyout, required: true },
  buyoutuuid: { type: String, required: true },
})

export const Buyoutlog = zyConnection.model('Buyoutlog', BuyoutlogSchema)
