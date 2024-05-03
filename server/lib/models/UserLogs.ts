import { Schema, model } from 'mongoose'
import { IUserLogs } from '@/data/types'

interface IUserLogsSchema extends IUserLogs, Document {}

const UserLogsSchema = new Schema<IUserLogsSchema>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userNick: { type: String, required: true },
    userEmail: { type: String, required: true },
    uuidCompany: { type: String, required: false },
    description: { type: String, required: true },
    documentType: { type: String, required: true },
    documentId: { type: String, required: false },
    mp: { type: String, required: false },
    createdAt: { type: Date, default: ()=>{ 
        const nowDate = new Date()
        return nowDate
    } }
})

export const UserLogs = model<IUserLogsSchema>('UserLogs', UserLogsSchema)
