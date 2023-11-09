import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'
import { User } from '~/server/lib/models/User'

const TransactionSearchSchema = new Schema({
    adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
    client: { type: Schema.Types.ObjectId, ref: User, required: true },
    transaction: { type: String, required: true },
    transactionDate: { type: Date, required: true },
    status: { type: String, default: 'created' },
    requestDate: { type: Date, default: new Date() },
})

export const TransactionSearch = model('TransactionSearch', TransactionSearchSchema)
