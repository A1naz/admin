import type { Nitro } from 'nitropack'
import mongoose from 'mongoose'
import { paymenthistory } from './lib/models/Paymenthistory'

export default async (_nitroApp: Nitro) => {
  const config = useRuntimeConfig()
  try {
    await mongoose.connect(config.MONGODB_URI)
    const history = await paymenthistory.find()

    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB')
  }
  catch (error) {
    console.error(error)
  }
}
