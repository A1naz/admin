import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const PVZOzonConnection = mongoose.createConnection(config.OZON_PVZ_DB_URI)