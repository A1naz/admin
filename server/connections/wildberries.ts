import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const wildberriesConnection = mongoose.createConnection(config.WB_DB_URI)