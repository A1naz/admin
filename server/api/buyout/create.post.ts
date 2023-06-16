import fs from 'node:fs'
import { v4 as uuid } from 'uuid'
import { Buyout } from '@/server/lib/models/Buyout'
import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'

interface Rule {
  id: number
  description: string
  category: number
  relies?: number
}
interface Item {
  image: string
  name: string
  article: number
  price: number
  priceText: string
  quantity: number
  sizes: number[] | string[]
  sex: string
  searchQuery: string[]
  adress: string
  dateRange: [Date, Date]
  selectedSize: number | string
  rules: Rule[]
}
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const last = await Buyout.findOne({ user }).sort({ _id: -1 })
  const products: Item[] = body
  for await (const product of products) {
    const rules = product.rules.map(rule => rule.id)
    const pickpoints = JSON.parse(fs.readFileSync('points.json', 'utf8'))
    const points = pickpoints.points
    const foundPoint = points.find((p: { a: string }) => p.a === product.adress)
    if (!foundPoint)
      throw createError('Выберите существующий пункт выдачи')
    const buyout = new Buyout({
      article: product.article,
      searchQuery: product.searchQuery.join(', '),
      point: product.adress,
      dateStart: product.dateRange[0],
      dateEnd: product.dateRange[1],
      sizeparam: product.selectedSize,
      quantity: product.quantity,
      gender: product.sex,
      status: 'active',
      user,
      rules,
      product: {
        name: product.name,
        price: product.price,
        priceText: product.priceText,
        image: product.image,
      },
      uuid: uuid(),
      place: last ? last.place + 1 : 1,
    })
    await buyout.save()
  }
  return {
    status: 'ok',
  }
})
