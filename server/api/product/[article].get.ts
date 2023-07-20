import fs from 'node:fs'
import { getServerSession } from '#auth'
import { findImage, findProductCard } from '~~/server/lib/helpers'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const params = event.context.params as any
  const url = findProductCard(params.article)
  const data: any = await $fetch(
    url,
    {
      method: 'GET',
    },
  ).catch((e) => {
    if (e.status === 404) {
      throw createError({
        message: 'Не найдена информация по данному артикулу.',
      })
    }
  })
  const rawData: any = await $fetch(
    `https://card.wb.ru/cards/detail?spp=0&regions=80,64,38,4,115,83,33,68,70,69,30,86,40,1,66,31,48,110,22&pricemarginCoeff=1.0&reg=0&appType=1&emp=0&locale=ru&lang=ru&curr=rub&couponsGeo=2,12,7,3,6,21&dest=12358353&nm=${params.article}`,
    {
      method: 'GET',
    },
  )
  const priceData = rawData
  let sizes = []

  if (priceData?.data?.products[0]?.sizes)
    sizes = priceData?.data?.products[0]?.sizes.filter((item: any) => item.stocks.length).map((item: any) => item.origName)
  else
    sizes = data?.sizes_table?.values.map((size: any) => size.tech_size)

  fs.writeFileSync('sizes.json', JSON.stringify(sizes))
  const product = priceData?.data?.products.find(
    (item: any) => item.id === Number(params.article),
  )
  const priceRaw = product?.salePriceU.toString()
  let instock = false
  if (!product) {
    throw createError({
      statusCode: 400,
      message: 'Не удалось получить данные о товаре',
    })
  }
  product.sizes.forEach((size: any) => {
    if (size.stocks.length > 0)
      instock = true
  })
  if (!priceRaw || !sizes) {
    throw createError({
      statusCode: 400,
      message: 'Не удалось получить данные о товаре',
    })
  }
  if (!instock) {
    throw createError({
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
  const image = findImage(Number(params.article))
  return {
    product: {
      image,
      article: (data.nm_id as number) || (params.article as number),
      name: `${data.selling.brand_name} / ${data.imt_name}` || '',
      sizes: (sizes as number[]) || [],
      price: (price as number) || 0,
      priceText: (priceText as string) || '',
    },
  }
})
