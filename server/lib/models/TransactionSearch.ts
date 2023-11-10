import { Schema, model } from 'mongoose'
import { AdminUser } from './AdminUser'
import { User } from '~/server/lib/models/User'

const TransactionSearchSchema = new Schema({
    adminUser: { type: Schema.Types.ObjectId, ref: AdminUser, required: true },
    client: { type: Schema.Types.ObjectId, ref: User, required: true },
    sum: { type: Number, required: true },
    transactionDate: { type: Date, required: true },
    status: { type: String, default: 'created' },
    phoneNumber: { type: String, required: true },
    requestDate: { type: Date, default: new Date() },
})

export const TransactionSearch = model('TransactionSearch', TransactionSearchSchema)
