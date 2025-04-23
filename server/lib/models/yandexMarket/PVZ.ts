import { Schema, model } from 'mongoose'
import { PVZOzonConnection } from '~/server/connections/ozonPVZ'

const PVZSchema = new Schema({
  pointId: { type: Number },
  coordinates: { type: Object },
  isOwn: { type: Boolean },
  status: { type: String },
})

export const PVZ = PVZOzonConnection.model('ympvz', PVZSchema, 'ympvz')
