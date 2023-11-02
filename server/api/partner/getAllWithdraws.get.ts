import { AdminUser } from '~/server/lib/models/AdminUser'
import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'
import { getServerSession } from '#auth'
const withdrawsPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { page }: any = getQuery(event)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin|| !userAdmin.tabs.includes('управление партнеркой'))
    return sendRedirect(event, '/auth', 302)

  const withdraws = await PartnerWithdraw.find({})
    .skip(withdrawsPerPage * (+page - 1))
    .limit(withdrawsPerPage)
  const withdrawsCount = await PartnerWithdraw.count()

  return {
    withdraws,
    withdrawsCount,
  }
})
