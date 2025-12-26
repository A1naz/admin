import { Types } from 'mongoose'

/**
 * Валидация MongoDB ObjectId для защиты от NoSQL injection
 * @param id - ID для проверки
 * @returns true если ID валидный
 */
export function validateObjectId(id: any): boolean {
  if (typeof id !== 'string') {
    return false
  }
  return Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Валидация и выброс ошибки если ID невалиден
 * @param id - ID для проверки
 * @param fieldName - название поля для сообщения об ошибке
 * @throws createError если ID невалиден
 */
export function requireValidObjectId(id: any, fieldName: string = 'ID'): void {
  if (!validateObjectId(id)) {
    throw createError({
      statusCode: 400,
      message: `Invalid ${fieldName} format`,
    })
  }
}

