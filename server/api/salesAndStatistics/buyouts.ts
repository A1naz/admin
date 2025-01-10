import { Buyout as OzonBuyout } from '~/server/lib/models/ozon/Buyout'
import { Buyout as WildberriesBuyouts } from '~/server/lib/models/Buyout'
export default async function (
  items: any[],
  productName: string,
  article: string
) {


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

  const ozonBuyouts = await OzonBuyout.find({
    uuid: {
      $in: ozonItems.map((item) => item.basisoperation.split('Выкуп #')[1]),
    },
    'product.name': productName
      ? { $regex: productName, $options: 'i' }
      : { $regex: '', $options: 'i' },
    article: article ? Number(article) : { $exists: true },
  })

  const wbByouts = await WildberriesBuyouts.find({
    uuid: {
      $in: wbItems.map((item) => item.basisoperation.split('Выкуп #')[1]),
    },
    'product.name': productName
      ? { $regex: productName, $options: 'i' }
      : { $regex: '', $options: 'i' },
    article: article ? article : { $exists: true },
  })


  const allBuyouts = [...ozonBuyouts, ...wbByouts]

  const formatted = items.map((item: any) => {
    const foundBuyout = allBuyouts.find(
      (buyout) => buyout.uuid === item.basisoperation.replace('Выкуп #', '')
    )

    return {
      productName: foundBuyout ? foundBuyout.product.name : '',
      article: foundBuyout ? foundBuyout.article : '',
      ...item,
    }
  })

  // const formatted = allBuyouts.map((buyout: any) => {
  //   const foundItem = items.find(
  //     (item) => item.basisoperation.split('Выкуп #')[1] === buyout.uuid
  //   )

  //   return {
  //     productName: buyout.product.name,
  //     article: buyout.article,
  //     ...foundItem,
  //   }
  // })

  return formatted
}
