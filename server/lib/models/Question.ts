import { Schema, model } from 'mongoose'

const QuestionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'created' },
  article: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String },
  gender: { type: String },
  createdDate: { type: Date, default: new Date(Date.now()) },
  publishDate: { type: Date, required: true },
})

export const Question = model('Question', QuestionSchema)
