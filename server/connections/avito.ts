import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const AvitoConnection = mongoose.createConnection(config.AVITO_DB_URI)