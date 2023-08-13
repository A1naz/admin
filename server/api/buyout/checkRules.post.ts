import type { Rule } from '@/data/buyout/rules'
import { getServerSession } from '#auth'
import { findPositionByQuery } from '@/server/lib/helpers'

interface Item {
  image: string
  name: string
  article: number
  price: number
  priceText: string
  quantity: number
  sizes: number[] | string[]
  sex: string
  searchQuery: any[]
  adress: string
  dateRange: [Date, Date]
  selectedSize: number | string
  rules: Rule[]
}

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const products: Item[] = body
  const result = {
    success: true,
    message: '',
  }
  for (const item of products) {
    const rules = item.rules.map(rule => rule.id)
    let sort = 'popular'

    if (rules.includes(11))
      sort = 'priceup'
    if (rules.includes(12))
      sort = 'pricedown'
    if (rules.includes(13))
      sort = 'newly'
    if (rules.includes(14))
      sort = 'benefit'
    if (rules.includes(15))
      sort = 'rate'

    if (rules.includes(5) || rules.includes(9)) {
      for (const query of item.searchQuery) {
        const searchResult = await findPositionByQuery(query.value, item.article, sort)
        if (!searchResult.found) {
          result.success = false
          result.message = `Товар ${item.article} не найден в поисковой выдаче по запросу ${query.value}`
          return result
        }
      }
    }
    if (rules.includes(8)) {
      for (const query of item.searchQuery) {
        const searchResult = await findPositionByQuery(query.value, item.article)
        if (!searchResult.found) {
          result.success = false
          result.message = `Товар ${item.article} не найден в поисковой выдаче по запросу ${query.value}`
          return result
        }
        if (!searchResult.advert) {
          result.success = false
          result.message = `Товар ${item.article} не найден в рекламе по запросу ${query.value}`
          return result
        }
      }
    }
  }
  return result
})
