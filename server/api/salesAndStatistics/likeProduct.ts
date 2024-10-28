import { ProductLike as WildberriesLike } from '~/server/lib/models/ProductLike'
import { ProductLike as OzonLike } from '~/server/lib/models/ozon/ProductLike'

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

  const ozonCarts = await OzonLike.find({
    _id: {
      $in: wbItems.map((item) =>
        item.basisoperation.includes('Лайк товара/бренда #')
          ? item.basisoperation.split('Лайк товара/бренда #')[1]
          : item.basisoperation
      ),
    },
    article: article ? article : { $exists: true },
  })

  const wbCarts = await WildberriesLike.find({
    _id: {
      $in: wbItems.map((item) =>
        item.basisoperation.includes('Лайк товара/бренда #')
          ? item.basisoperation.split('Лайк товара/бренда #')[1]
          : item.basisoperation
      ),
    },
    article: article ? article : { $exists: true },
  })

  const allItems = [...ozonCarts, ...wbCarts]

  const formatted = allItems.map((item) => {
    const payment = items.find((i) => i.basisoperation === item._id.valueOf())
    delete payment.article
    return {
      ...payment,
      productName: 'у лайков неизвестно',
      article: '',
    }
  })

  console.log(formatted)

  return formatted
}
