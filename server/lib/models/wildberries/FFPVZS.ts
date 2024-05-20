import { Schema, model } from 'mongoose'
import { wildberriesConnection } from '~/server/connections/wildberries'

const FFPVZSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pvzs: { type: Array },
})

export const FFPVZ = wildberriesConnection.model('FFPVZ', FFPVZSchema)
