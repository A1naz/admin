import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import getTopBuyouts from '~/server/lib/helpers/stats/topBuyouts'
import getTopArticles from '~/server/lib/helpers/stats/topArticles'
import getTopPVZ from '~/server/lib/helpers/stats/topPVZ'
import getTopUsersByDeposit from '~/server/lib/helpers/stats/topUsersByDeposit'
import getTopUsersByPartnerPayments from '~/server/lib/helpers/stats/topUsersByPartnerPayments'
import getTopUsersByPartnerBalance from '~/server/lib/helpers/stats/topUsersByPartnerBalance'

let top50Buyouts: any[] = []
let top50Articles: any[] = []
let top50pvz: any[] = []
let top50UsersByDeposit: any[] = []
let top100UsersByPartnerBalance: any[] = []
let top100UsersByPartnerPayments: any[] = []
let lastDates: any[] = []

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('аналитика'))
    return sendRedirect(event, '/auth', 302)

  const { searchValue, selectedTop }: any = getQuery(event)

  if (selectedTop === 'top50Buyouts') {
    top50Buyouts = await getTopBuyouts()
  }

  if (selectedTop === 'top50Articles') {
    top50Articles = await getTopArticles()
  }
  if (selectedTop === 'top50pvz') {
    top50pvz = await getTopPVZ()
  }

  if (selectedTop === 'top50UsersByDeposit') {
    top50UsersByDeposit = await getTopUsersByDeposit(searchValue)
  }

  if (selectedTop === 'top100UsersByPartnerPayments') {
    top100UsersByPartnerPayments = await getTopUsersByPartnerPayments(searchValue)
  }

  if (selectedTop === 'top100UsersByPartnerBalance') {
    top100UsersByPartnerBalance = await getTopUsersByPartnerBalance(searchValue)
  }

  return {
    top50Buyouts,
    top50Articles,
    top50pvz,
    top50UsersByDeposit,
    top100UsersByPartnerBalance,
    top100UsersByPartnerPayments,
  }
})
