import { Schema, model } from 'mongoose'
import { OzonConnection } from '~/server/connections/ozon'

const PVZSchema = new Schema({
  pointId: { type: Number },
  coordinates: { type: Object },
  isOwn: { type: Boolean },
  status: { type: String },
})

export const PVZ = OzonConnection.model('pvz', PVZSchema, 'pvz')
