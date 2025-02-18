import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const yandexConnection = mongoose.createConnection(config.YANDEX_MARKET_DB_URI)