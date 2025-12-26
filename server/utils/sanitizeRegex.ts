/**
 * Экранирование специальных символов regex для защиты от ReDoS атак
 * @param string - строка для экранирования
 * @returns безопасная строка для использования в regex
 */
export function escapeRegex(string: string): string {
  if (typeof string !== 'string') {
    return ''
  }
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Санитизация поискового запроса
 * @param query - поисковый запрос
 * @param maxLength - максимальная длина (по умолчанию 100)
 * @returns безопасный поисковый запрос
 */
export function sanitizeSearchQuery(query: string, maxLength: number = 100): string {
  if (typeof query !== 'string') {
    return ''
  }
  
  // Обрезаем до максимальной длины
  const trimmed = query.trim().substring(0, maxLength)
  
  // Экранируем специальные символы regex
  return escapeRegex(trimmed)
}

