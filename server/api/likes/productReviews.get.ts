import { getServerSession } from '#auth'
import { findProductCard } from '@/server/lib/helpers'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const { article, limit } = getQuery(event)
  if (!article) {
    return send(event, {
      status: 400,
      body: 'Article is required',
    })
  }
  const urlToCard = findProductCard(article)
  const data: any = await $fetch(
    urlToCard,
    {
      method: 'GET',
    },
  )
  const imt_id = data?.imt_id
  if (!imt_id) {
    throw createError({
      statusCode: 404,
      message: 'Не удалось получить информацию по товару',
    })
  }

  const urlData: any = await $fetch(
    `https://feedback-bt.wildberries.ru/feedback/api/v1/host?imt=${imt_id}`,
    {
      method: 'GET',
      headers: {
        devicename: 'Android, SM-G988N(z3qksx)',
      },
    },
  )
  const url = urlData[0]
  const feedbackData: any = await $fetch(url, {
    method: 'GET',
    headers: {
      'Connection': 'Keep-Alive',
      'Accept-Encoding': 'gzip',
      'User-Agent': 'okhttp/4.10.0',
    },
  })
  if (!feedbackData?.feedbacks) {
    throw createError({
      statusCode: 404,
      message: 'Не удалось получить информацию по товару',
    })
  }
  const limited = feedbackData.feedbacks.slice(0, parseInt(limit as string))
  const feedbacks = limited.map((feedback: any) => {
    const likes = feedback?.feedbackHelpfulness?.filter(
      (help: any) => help.helpfulness === 'plus',
    ).length
    const dislikes = feedback?.feedbackHelpfulness?.filter(
      (help: any) => help.helpfulness === 'minus',
    ).length
    return {
      id: feedback.id,
      rating: feedback.productValuation,
      text: feedback.text,
      date: feedback.createdDate,
      user: {
        name: feedback.wbUserDetails.name
          ? feedback.wbUserDetails.name
          : 'Покупатель Wildberries',
        country: feedback.wbUserDetails.country,
      },
      likes: likes || 0,
      dislikes: dislikes || 0,
      rank: feedback.rank,
    }
  })
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  return feedbacks
})
