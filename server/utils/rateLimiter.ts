import { LoginAttempt } from '@/server/lib/models/LoginAttempt'
import type { H3Event } from 'h3'

const RATE_LIMITS = {
  PER_IP_PER_HOUR: 3,              // 3 попытки за 60 минут с одного IP
  PER_IDENTIFIER_PER_HOUR: 4,      // 4 попытки за 60 минут на один идентификатор
  PER_IDENTIFIER_PER_DAY: 10,      // 10 попыток в день на один идентификатор
  BLOCK_AFTER_FAILED: 10,          // Блокировка после 10 неудачных попыток
  BLOCK_DURATION: 3600000,         // Блокировка на 60 минут (в миллисекундах)
  SUSPICIOUS_IPS_THRESHOLD: 5,     // Подозрительно если 5+ разных IP для одного идентификатора
}

export function getClientIP(event: H3Event): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return event.node.req.socket?.remoteAddress || 'unknown'
}

export async function checkRateLimit(
  event: H3Event,
  identifier: string
): Promise<{ allowed: boolean; reason?: string; waitTime?: number }> {
  const ip = getClientIP(event)
  const now = new Date()
  const normalizedIdentifier = identifier.toLowerCase().trim()
  
  // 1. Проверка лимита по IP (3 попытки за 60 минут)
  const oneHourAgo = new Date(now.getTime() - 3600000)
  const ipAttempts = await LoginAttempt.countDocuments({
    ip,
    createdAt: { $gte: oneHourAgo }
  })
  
  if (ipAttempts >= RATE_LIMITS.PER_IP_PER_HOUR) {
    return {
      allowed: false,
      reason: 'Слишком много попыток входа с вашего IP. Попробуйте через 1 час.',
      waitTime: 3600
    }
  }
  
  // 2. Проверка лимита по идентификатору (4 попытки за 60 минут)
  const identifierAttemptsPerHour = await LoginAttempt.countDocuments({
    identifier: normalizedIdentifier,
    createdAt: { $gte: oneHourAgo }
  })
  
  if (identifierAttemptsPerHour >= RATE_LIMITS.PER_IDENTIFIER_PER_HOUR) {
    return {
      allowed: false,
      reason: 'Слишком много попыток входа. Попробуйте через 1 час.',
      waitTime: 3600
    }
  }

  // 3. Проверка лимита по идентификатору (10 попыток в день)
  const oneDayAgo = new Date(now.getTime() - 86400000)
  const identifierAttemptsPerDay = await LoginAttempt.countDocuments({
    identifier: normalizedIdentifier,
    createdAt: { $gte: oneDayAgo }
  })
  
  if (identifierAttemptsPerDay >= RATE_LIMITS.PER_IDENTIFIER_PER_DAY) {
    return {
      allowed: false,
      reason: 'Превышен дневной лимит попыток входа. Попробуйте завтра.',
      waitTime: 86400
    }
  }
  
  // 4. Проверка на подозрительную активность (множество IP адресов)
  const uniqueIPsForIdentifier = await LoginAttempt.distinct('ip', {
    identifier: normalizedIdentifier,
    createdAt: { $gte: oneHourAgo }
  })
  
  if (uniqueIPsForIdentifier.length >= RATE_LIMITS.SUSPICIOUS_IPS_THRESHOLD) {
    return {
      allowed: false,
      reason: 'Обнаружена подозрительная активность. Попробуйте позже или обратитесь в поддержку.',
      waitTime: 3600 
    }
  }

  // 5. Проверка блокировки после множественных неудачных попыток (10 за день)
  const recentFailedAttempts = await LoginAttempt.countDocuments({
    identifier: normalizedIdentifier,
    success: false,
    createdAt: { $gte: oneDayAgo }
  })
  
  if (recentFailedAttempts >= RATE_LIMITS.BLOCK_AFTER_FAILED) {
    const lastFailedAttempt = await LoginAttempt.findOne({
      identifier: normalizedIdentifier,
      success: false
    }).sort({ createdAt: -1 })
    
    if (lastFailedAttempt) {
      const timeSinceLastAttempt = now.getTime() - lastFailedAttempt.createdAt.getTime()
      
      if (timeSinceLastAttempt < RATE_LIMITS.BLOCK_DURATION) {
        const waitSeconds = Math.ceil((RATE_LIMITS.BLOCK_DURATION - timeSinceLastAttempt) / 1000)
        const waitMinutes = Math.ceil(waitSeconds / 60)
        return {
          allowed: false,
          reason: `Аккаунт временно заблокирован из-за множественных неудачных попыток входа. Попробуйте через ${waitMinutes} минут.`,
          waitTime: waitSeconds
        }
      }
    }
  }
  
  return { allowed: true }
}

export async function logLoginAttempt(
  event: H3Event,
  identifier: string,
  success: boolean
): Promise<void> {
  const ip = getClientIP(event)
  const userAgent = getHeader(event, 'user-agent')
  
  try {
    await LoginAttempt.create({
      identifier: identifier.toLowerCase().trim(),
      ip,
      success,
      userAgent,
      createdAt: new Date()
    })
  } catch (error) {
    console.error('Failed to log login attempt:', error)
  }
}

export async function clearOldLoginAttempts(identifier: string): Promise<void> {
  try {
    const oneDayAgo = new Date(Date.now() - 86400000)
    await LoginAttempt.deleteMany({
      identifier: identifier.toLowerCase().trim(),
      success: false,
      createdAt: { $lt: oneDayAgo }
    })
  } catch (error) {
    console.error('Failed to clear old login attempts:', error)
  }
}

