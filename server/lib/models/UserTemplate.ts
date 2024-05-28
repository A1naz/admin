import { Schema, model } from 'mongoose'
import { v4 as uuid } from 'uuid'
import { User } from '~/server/lib/models/User'

const UserTemplateSchema = new Schema({
  uuid: { type: String, default: uuid(), required: true },
  user: { type: Schema.Types.ObjectId, required: true },
  userUuid: { type: String, required: true },
  usersArray: { type: [Object], required: true },
  title: { type: String, required: true },
})

export const UserTemplate = model('UserTemplate', UserTemplateSchema)
