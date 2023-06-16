import type { Nitro } from 'nitropack'
import mongoose from 'mongoose'
import { Review } from './lib/models/Review'
import { Delivery } from './lib/models/Delivery'

export default async (_nitroApp: Nitro) => {
  const config = useRuntimeConfig()
  try {
    await mongoose.connect(config.MONGODB_URI)
    for await (const review of Review.find()) {
      const delivery = await Delivery.findOne({ _id: review.delivery })
      if (!delivery) {
        console.log('Could not find delivery')
      }
      else {
        if (!delivery.reviewed) {
          console.log(delivery)
          delivery.reviewed = true
          await delivery.save()
        }
      }
    }
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB')
  }
  catch (error) {
    console.error(error)
  }
}
