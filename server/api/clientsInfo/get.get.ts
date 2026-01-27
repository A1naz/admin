import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import getUsers from './getUsersByStatus'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

const limit = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('клиенты')))
    return sendRedirect(event, '/auth', 302)

  const { dateRange, searchQuery, page, status, clientsType }: any =
    getQuery(event)

  console.log('Original searchQuery:', searchQuery)
  console.log('Type:', typeof searchQuery)

  // ✅ FIX: Санитизация для защиты от ReDoS
  const safeSearchQuery = searchQuery ? sanitizeSearchQuery(searchQuery, 100) : ''
  
  console.log('Safe searchQuery:', safeSearchQuery)
  
  // Извлекаем только цифры для поиска по телефону
  const phoneDigits = safeSearchQuery.replace(/[^\d]/g, '')
  
  // Поиск по телефону активируется только если:
  // 1. Запрос начинается с "+" (например, +7906...)
  // 2. ИЛИ запрос состоит преимущественно из цифр (>70% цифр) И длина >= 7
  const looksLikePhone = safeSearchQuery.startsWith('+') || 
    (phoneDigits.length >= 7 && phoneDigits.length / safeSearchQuery.length > 0.7)
  
  const searchQueryParam: any = safeSearchQuery
    ? {
        $or: [
          { username: { $regex: safeSearchQuery, $options: 'i' } },
          { orgName: { $regex: safeSearchQuery, $options: 'i' } },
          // Добавляем поиск по телефону только если запрос похож на номер телефона
          ...(looksLikePhone ? [{
            phoneNumber: {
              $regex: phoneDigits,
              $options: 'i',
            },
          }] : []),
        ],
      }
    : {}

  console.log('Phone digits:', phoneDigits, 'Looks like phone:', looksLikePhone)
  console.log('searchQueryParam:', JSON.stringify(searchQueryParam, null, 2))

  let users = []
  if (status === 'all') {
    users = await getUsers.allUsers(
      page,
      searchQueryParam,
      dateRange,
      clientsType
    )
  } else if (status === 'active') {
    users = await getUsers.activeUsers(
      page,
      searchQueryParam,
      dateRange,
      clientsType
    )
  } else if (status === 'inactive') {
    users = await getUsers.inactiveUsers(
      page,
      searchQueryParam,
      dateRange,
      clientsType
    )
  } else {
    users = await getUsers.registeredUsers(
      page,
      searchQueryParam,
      dateRange,
      clientsType
    )
  }

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 82,
    actionDescription: `Админ ${user.uuid} - ${user.username} получил список информации о клиентах, вкладка Клиенты`,
    date: new Date(),
  })

  return users
})
