import { Schema, model } from 'mongoose'

const UserSchema = new Schema({
  url: { type: String, required: true },
})

export const Proxy = model('Proxy', UserSchema)
