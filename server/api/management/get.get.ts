import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import getBuyouts from '~/server/lib/helpers/getBuyouts'
import getDeliveries from '~/server/lib/helpers/getDeliveries'
import getReviews from '~/server/lib/helpers/getReviews'
import getLikes from '~/server/lib/helpers/getLikes'
import getProductLikes from '~/server/lib/helpers/getProductLikes'
import getQuestions from '~/server/lib/helpers/getQuestions'
import getCarts from '~/server/lib/helpers/getCarts'
import getReports from '~/server/lib/helpers/getReports'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { userId, status, item, page }: any = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.roles.includes('admin'))
    return sendRedirect(event, '/auth', 302)

  if (item == 'buyouts') {
    const { info, count } = await getBuyouts(userId, status, page)
    return { info, count }
  }
  if (item == 'deliveries') {
    const { info, count } = await getDeliveries(userId, status, page)
    return { info, count }
  }
  if (item == 'reviews') {
    const { info, count } = await getReviews(userId, status, page)
    return { info, count }
  }

  if (item == 'likes') {
    const { info, count } = await getLikes(userId, status, page)
    return { info, count }
  }

  if (item == 'questions') {
    const { info, count } = await getQuestions(userId, status, page)
    return { info, count }
  }

  if (item == 'productLikes') {
    const { info, count } = await getProductLikes(userId, status, page)
    return { info, count }
  }

  if (item == 'cart') {
    const { info, count } = await getCarts(userId, status, page)
    return { info, count }
  }

  if (item == 'reports') {
    const { info, count } = await getReports(userId, status, page)
    return { info, count }
  }
  return { info: [], count: 0 }
})
