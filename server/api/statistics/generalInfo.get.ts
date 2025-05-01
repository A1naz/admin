import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { User } from '~/server/lib/models/User'
import { HarmexReferrals } from '~/server/lib/models/HarmexReferrals'

const periods = [
    {
      title: 'Сегодня',
      value: 'today',
    },
    {
      title: 'Вчера',
      value: 'yesterday',
    },
    {
      title: '3 дня',
      value: 'threeDays',
    },
    {
      title: 'Неделя',
      value: 'week',
    },
    {
      title: 'Этот месяц',
      value: 'month',
    },
    {
      title: 'Прошлый месяц',
      value: 'lastMonth',
    },
    {
      title: 'Этот год',
      value: 'thisYear',
    },
    {
      title: 'Прошлый год',
      value: 'lastYear',
    },
  ]

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('статистика')))
    return sendRedirect(event, '/auth', 302)

  const { date } = getQuery(event)

  switch (date) {
    case 'today':
      break
    case 'yesterday':
      break
    case 'threeDays':
      break
    case 'week':
      break
    case 'month':
      break
    case 'lastMonth':
      break
    case 'thisYear':
      break
    case 'lastYear':
      break
  }

  const res = {
    allRegistrations: 0,
    selfRegistrations: 0,
    referralRegistrations: 0,
  }

  ///Блок с регистрациями
  const usersCount = await User.countDocuments()
  res.allRegistrations = usersCount
  const allReferrals = await HarmexReferrals.find({})
  let refCount = 0
  allReferrals.forEach((ref: any) => {
    refCount += ref.referrals.length
  })
  res.referralRegistrations = refCount
  res.selfRegistrations = res.allRegistrations - res.referralRegistrations
  ////Блок с регистрациями

  const allTurnover
})
