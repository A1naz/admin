import mongoose from 'mongoose'

const UTMCategorySchema = new mongoose.Schema({
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

export const UTMCategory = mongoose.model('UTMCategory', UTMCategorySchema)

