import { Schema, model } from 'mongoose'
import { OzonConnection } from '~/server/connections/ozon'

const FFPVZSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pvzs: { type: Array },
})

export const FFPVZ = OzonConnection.model('FFPVZ', FFPVZSchema)
