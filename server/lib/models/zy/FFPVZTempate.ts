import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { User } from '~/server/lib/models/User'
import { zyConnection } from '~/server/connections/zy'

const PVZTemplateSchema = new Schema({
  admin: { type: Schema.Types.ObjectId, required: true },
  pvzsArray: { type: [Object], required: true },
  title: { type: String, required: true },
  uuid: { type: String, default: uuid(), required: true },
})

export const PVZTemplate =  zyConnection.model('PVZTemplate', PVZTemplateSchema)
