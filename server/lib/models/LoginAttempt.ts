import { model, Schema } from 'mongoose'

interface ILoginAttempt extends Document {
  identifier: string // email, username или telegramId
  ip: string
  success: boolean
  createdAt: Date
  userAgent?: string
}

const LoginAttemptSchema = new Schema<ILoginAttempt>({
  identifier: { type: String, required: true },
  ip: { type: String, required: true },
  success: { type: Boolean, required: true },
  userAgent: { type: String, required: false },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 86400 // Автоматическое удаление записей старше 24 часов
  }
})

// Индекс для быстрого поиска попыток входа
LoginAttemptSchema.index({ identifier: 1, createdAt: -1 })
LoginAttemptSchema.index({ ip: 1, createdAt: -1 })

export const LoginAttempt = model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema)

