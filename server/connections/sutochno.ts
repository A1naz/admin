import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const sutochnoConnection = mongoose.createConnection(config.SUTOCHNO_DB_URI)