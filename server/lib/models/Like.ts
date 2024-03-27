import { Schema, model } from 'mongoose'
import { wildberriesConnection } from '~/server/connections/wildberries'

const LikeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  article: { type: String, required: true },
  status: { type: String, default: 'created', enum: ['created', 'work', 'completed', 'nofunds'] },
  image: { type: String },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  total: { type: Number },
  createdDate: { type: Date, default: new Date() },
  endedDate: { type: Date, default: null },
  progress: { type: Number },
  reviews: { type: Array },
})

export const Like = wildberriesConnection.model('Like', LikeSchema)
