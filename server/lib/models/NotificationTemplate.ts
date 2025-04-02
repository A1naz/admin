import { model, Schema } from 'mongoose'

const notificationSchema = new Schema({
        comment: { type: String },
        text: { type: String, required: true, text: true },
        category: { type: String },
        admin: { type: Schema.Types.ObjectId, ref: 'AdminUserHarmex' },
        uuid: { type: String },
        forAll: { type: Boolean, default: false },
        users: { type: Array },
        isReaded: { type: Boolean },
        readUser: { type: Array },
        isRemoved: { type: Boolean },
        removedUser: { type: Array },
        date: { type: Date, default: new Date(Date.now()) },
        activationDate: { type: Date },
        expireDate: { type: Date },
})

export const NotificationTemplate = model('notificationTemplate', notificationSchema)
