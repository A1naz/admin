import { Schema, model } from 'mongoose'

const DeliveryScreenshotRequestSchema = new Schema({
  uuid: { type: String, required: true },
  uuidbuyout: { type: String, required: true },
  requireDate: { type: Date, default: new Date() },
  responseDate: { type: Date },
  account: { type: String, required: true },
  status: { type: String, default: 'created' },
  article: { type: Number, requred: true },
  screenshot: { type: String, required: false },
  mp: { type: String, required: true },
})

export const DeliveryScreenshotRequest = model(
  'DeliveryScreenshotRequest',
  DeliveryScreenshotRequestSchema
)
