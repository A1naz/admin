import type { Document } from 'mongoose'
import { model, Schema } from 'mongoose'
import { v4 as uuid } from 'uuid'

const ServiceSchema = new Schema({
  uuid: { type: String, unique: true, required: true, default: uuid() },
  name: { type: String, required: true, unique: false },
  items: { type: [], default: [] }, // Mixed type for array
  mainImage: { type: String, required: true },
  images: { type: [String], default: [] }, // Array of strings for images
  video: { type: String },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  advanced: { type: Number, default: 0 },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  slug: { type: String, required: false },
  votes: { type: Number, default: 0 },
  backgroundColor: { type: String, default: '#ffffff' },
  type: { type: String },
  organization: { type: String},
  promoCode: { type: String},
  location: { type: String},
  INN: { type: String},
  phoneNumber: { type: String},
  telegram: { type: String},
  test: { type: Boolean, default: false },
})

// Mongoose Model for Service
export const Service = model('Service', ServiceSchema)
