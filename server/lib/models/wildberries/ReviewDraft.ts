import { Schema, model } from "mongoose";
import { IReviewDraft } from "~/data/types";
import { wildberriesConnection } from "~/server/connections/wildberries";

interface IReviewDraftSchema extends IReviewDraft, Document {}

const ReviewDraftSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    draftName: { type: String, required: false },
    article: { type: Number, required: false },
    text: { type: String, required: true },
    createdAt: { type: Date, default: new Date(Date.now()) },
})

ReviewDraftSchema.pre('save', function (next) {
    // Добавляем 3 часа к полю "date"
    this.createdAt.setHours(this.createdAt.getHours() + 3)
    next()
  })

export const ReviewDraft = wildberriesConnection.model<IReviewDraftSchema>('ReviewDrafts', ReviewDraftSchema)
