import { Cart as WildberriesCart } from '~/server/lib/models/Cart'
import { Cart as OzonCart } from '~/server/lib/models/ozon/Cart'

export default async function (items: any[], article: string) {
  const ozonItems = []
  const wbItems = []

  for (const item of items) {
    if (item.mp === 'ozon') {
      ozonItems.push(item)
    }

    if (item.mp === 'wildberries') {
      wbItems.push(item)
    }
  }

  const ozonCarts = await OzonCart.find({
    _id: {
      $in: ozonItems.map((item) => item.basisoperation),
    },
    article: article ? article : { $exists: true },
  })

  const wbCarts = await WildberriesCart.find({
    _id: {
      $in: wbItems.map((item) => item.basisoperation),
    },
    article: article ? article : { $exists: true },
  })

  const allItems = [...ozonCarts, ...wbCarts]

  const formatted = allItems.map((item) => {
    const payment = items.find((i) => i.basisoperation === item._id.valueOf())
    delete payment.article
    return {
      ...payment,
      productName: item.name,
      article: item.article,
    }
  })

  return formatted
}
