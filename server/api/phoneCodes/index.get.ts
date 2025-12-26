import { ConfirmPhone } from '~/server/lib/models/ConfirmPhone'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { phone, page, sortDate }: any = getQuery(event)
  const elPerPage = 50

  if (!session)
    return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('коды регистраций'))
  )
    return sendRedirect(event, '/auth', 302)

  const query: any = {}
  if (phone && phone.length > 0) {
    let searchTerm = phone.replace(/\D/g, '')
    if (searchTerm.startsWith('8') && searchTerm.length === 11) {
      searchTerm = '7' + searchTerm.substring(1)
    }
    // ✅ FIX: Санитизация searchTerm для защиты от ReDoS
    query.phone = { $regex: sanitizeSearchQuery(searchTerm, 20), $options: 'i' }
  }
  const count = await ConfirmPhone.countDocuments(query)
  const codes = await ConfirmPhone.find(query)
    .sort({ date: sortDate || -1 })
    .skip((page - 1) * elPerPage)
    .limit(elPerPage)

  return { codes, count }
})
