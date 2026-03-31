import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const reportsConnection = mongoose.createConnection(config.REPORTS_DB_URI as string)