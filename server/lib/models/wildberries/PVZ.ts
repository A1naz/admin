import { Schema, model } from 'mongoose'
import { PVZOzonConnection } from '~/server/connections/ozonPVZ'

const PVZSchema = new Schema({
  pointId: { type: Number },
  coordinates: { type: Array },
  isOwn: { type: Boolean },
  status: { type: String },
  address: { type: String },
})

export const PVZ = PVZOzonConnection.model('wb', PVZSchema, 'wb')
