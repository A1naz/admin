import mongoose from 'mongoose'

const UTMPlatformSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const UTMPlatform = mongoose.model('UTMPlatform', UTMPlatformSchema)

