import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const zyConnection = mongoose.createConnection(config.GOLD_APPLE_DB_URI)
