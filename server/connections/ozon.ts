import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const OzonConnection = mongoose.createConnection(config.OZON_DB_URI)