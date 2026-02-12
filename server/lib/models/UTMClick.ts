import mongoose from 'mongoose'

const UTMClickSchema = new mongoose.Schema({
  utmCode: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  date: {
    type: Date,
  },
})

export const UTMClick = mongoose.model('UTMClick', UTMClickSchema)

