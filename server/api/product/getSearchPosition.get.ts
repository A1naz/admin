import { getServerSession } from '#auth'
import { findPositionByQuery } from '@/server/lib/helpers'

export default eventHandler(async (event) => {
  try {
    const session = (await getServerSession(event)) as any

    if (!session)
      return sendRedirect(event, '/auth', 302)

    const { article, query } = getQuery(event)
    if (!article || !query)
      return { found: false, page: -1, advert: false }
    const result = await findPositionByQuery(query.toString(), Number(article))
    return result
  }
  catch (e) {
    throw createError(e as string)
  }
})
