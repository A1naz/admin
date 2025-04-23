import { OzonHotelsConnection } from '~/server/connections/ozonHotels'
import { Schema, model } from 'mongoose'

const TaskLogSchema = new Schema({
  date: { type: Date, required: true },
  text: { type: String, required: true, text: true },
  task: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, required: true },
  taskUuid: { type: String, required: true },
})

export const TaskLog = OzonHotelsConnection.model('TaskLog', TaskLogSchema)
