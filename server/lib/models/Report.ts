import { Schema, model } from 'mongoose'

const ReportSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  card: { type: String, required: true },
  screenshots: { type: Array, requried: true },
})

export const Report = model('Report', ReportSchema)
