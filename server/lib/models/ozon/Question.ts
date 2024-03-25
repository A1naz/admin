import { Schema, model } from 'mongoose'
import { OzonConnection } from '~/server/connections/ozon'

const QuestionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'created' },
  article: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String },
  gender: { type: String },
  createdDate: { type: Date, default: new Date(Date.now()) },
  publishDate: { type: Date, required: true },
  anonim: {type: Boolean, default: false},
})

QuestionSchema.pre('save', function (next) {
  // Добавляем 3 часа к полю "date"
  this.createdDate.setHours(this.createdDate.getHours() + 3)
  next()
})

export const Question = OzonConnection.model('Question', QuestionSchema)
