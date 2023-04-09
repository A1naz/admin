import { Buyout } from '@/server/lib/models/Buyout'
import { getServerSession } from '#auth'

function findImage(article: number) {
  function p(t: any, e: any) {
    for (let i = 0; i < e.length; i++) {
      if (t <= e[i])
        return i + 1
    }
  }

  const t = article
  const c = [143, 287, 431, 719, 1007, 1061, 1115, 1169, 1313, 1601, 1655]

  const n = Math.floor(t / 1e5)
  const a = p(n, c)

  const result = `https://basket-${
  (a as number) < 10 ? `0${a}` : a
  }.wb.ru/vol${n}/part${Math.floor(article / 1e3)}/${article}/images/big/1.jpg`
  return result
}
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  interface Item {
    image: string
    name: string
    article: number
    price: number
    priceText: string
    quantity: number
    sizes: number[] | string[]
    sex: string
    searchQuery: string
    adress: string
    dateRange: [Date | null, Date | null] | []
    selectedSize: number | string
    rules: {
      [key: number]: boolean
    }
  }
  const query = getQuery(event)
  const buyout = await Buyout.findOne({ uuid: query.uuid })
  if (!buyout) {
    return createError({
      statusCode: 400,
      message: 'Выкуп не найден',
    })
  }

  const article = buyout?.article
  const data: any = await $fetch(
    `https://wbx-content-v2.wbstatic.net/ru/${article}.json`,
    {
      method: 'GET',
    },
  )

  const rawData: any = await $fetch(
  `https://card.wb.ru/cards/detail?spp=0&regions=80,64,38,4,115,83,33,68,70,69,30,86,40,1,66,31,48,110,22&pricemarginCoeff=1.0&reg=0&appType=1&emp=0&locale=ru&lang=ru&curr=rub&couponsGeo=2,12,7,3,6,21&dest=12358353&nm=${article}`,
  {
    method: 'GET',
  },
  )
  const sizes = data?.sizes_table?.values
    ? data?.sizes_table?.values.map((size: any) => size.tech_size)
    : []
  const priceData = JSON.parse(rawData)
  const product = priceData?.data?.products.find(
    (item: any) => item.id === Number(article),
  )
  const priceRaw = product?.salePriceU.toString()
  let instock = false
  product.sizes.forEach((size: any) => {
    if (size.stocks.length > 0)
      instock = true
  })

  if (!priceRaw || !sizes) {
    return createError({
      statusCode: 400,
      message: 'Не удалось получить данные о товаре',
    })
  }
  if (!instock) {
    return createError({
      statusCode: 400,
      message: 'Товара нет в наличии',
    })
  }
  const price = priceRaw?.substring(0, priceRaw.length - 2)
  const currency = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  const priceText = currency.format(price)
  const image = findImage(data.nm_id)
  return {
    image,
    article: (data.nm_id as number) || (buyout.article as number),
    name: `${data.selling.brand_name} / ${data.imt_name}` || '',
    sizes: (sizes as number[] | string[]) || [],
    price: (price as number) || 0,
    priceText: (priceText as string) || '',
    quantity: buyout.quantity,
    sex: buyout.gender,
    searchQuery: buyout.searchQuery,
    adress: buyout.point,
    dateRange: [buyout.dateStart, buyout.dateEnd],
    selectedSize: buyout.sizeparam,
    rules: buyout.rules,
  }
})
