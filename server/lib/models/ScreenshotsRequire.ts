import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'
import { reportsConnection } from '~/server/connections/reports'

const screenshotsRequireSchema = new Schema({
  adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
  typeOperation: { type: String, required: true },
  requireDate: { type: Date, default: new Date() },
  responseDate: { type: Date },
  account: { type: String, required: true },
  status: { type: String, default: 'created' },
  article: { type: Number, requred: true },
  screenshots: [{ type: String }],
  uuidbuyout: { type: String, required: false },
  mp: { type: String, required: true },
})

export const ScreenshotsRequire = reportsConnection.model(
  'ScreenshotsRequire',
  screenshotsRequireSchema
)
