import { getServerSession } from '#auth'
import { findImage, findProductCard } from '@/server/lib/helpers'
import { User } from '@/server/lib/models/User'

function isValidUrl(urlString: string) {
  const urlPattern = new RegExp('^(https?:\\/\\/)?' // validate protocol
  + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // validate domain name
  + '((\\d{1,3}\\.){3}\\d{1,3}))' // validate OR ip (v4) address
  + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // validate port and path
  + '(\\?[;&a-z\\d%_.~+=-]*)?' // validate query string
  + '(\\#[-a-z\\d_]*)?$', 'i') // validate fragment locator
  return !!urlPattern.test(urlString)
}
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { url } = await readBody(event)
  if (!isValidUrl(url)) {
    throw createError({
      statusCode: 400,
      message: 'invalid url',
    })
  }
  const splitted = url.split('/')
  if (splitted.at(-1) === 'detail.aspx') {
    const article = splitted[splitted.length - 2]
    const url = findProductCard(article)
    const data: any = await $fetch(
      url,
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
    const priceData = rawData

    const product = priceData?.data?.products.find(
      (item: any) => item.id === Number(article),
    )
    const priceRaw = product?.salePriceU.toString()
    if (!product) {
      return createError({
        statusCode: 400,
        message: 'Не удалось получить данные о товаре',
      })
    }
    if (!priceRaw) {
      return createError({
        statusCode: 400,
        message: 'Не удалось получить данные о товаре',
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
    const image = findImage(Number(article))
    return {
      type: 'product',
      image,
      article: (data.nm_id as number) || (article as number),
      name: `${data.selling.brand_name} / ${data.imt_name}` || '',
      price: (price as number) || 0,
      priceText: (priceText as string) || '',
    }
  }
  else if (splitted.at(-2) === 'brands') {
    const brand = splitted.at(-1)
    const data: { name: string; id: number; siteId: number } = await $fetch(`https://static.wbstatic.net/data/brands/${brand}.json`, { method: 'GET' })
    const image = `https://images.wbstatic.net/brands/small/${data.id}.jpg`
    return {
      type: 'brand',
      name: data.name,
      id: data.id,
      image,
    }
  }
})
