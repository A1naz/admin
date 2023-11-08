import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'

const TransactionSearchSchema = new Schema({
    adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
    transaction: { type: String, required: true },
    status: { type: String, default: 'created' },
    date: { type: Date, default: new Date() },
})

export const TransactionSearch = model('TransactionSearch', TransactionSearchSchema)
