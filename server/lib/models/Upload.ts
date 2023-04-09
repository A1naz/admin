import { Schema, model } from 'mongoose'

const UploadSchema = new Schema({
  type: { type: String, required: true },
  filename: { type: String, required: true },
  data: { type: Schema.Types.Buffer, required: true },
})

export const Upload = model('Upload', UploadSchema)
