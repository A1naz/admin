import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const OzonHotelsConnection = mongoose.createConnection(config.OZON_HOTELS_DB_URI)