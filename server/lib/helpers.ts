const c = [143, 287, 431, 719, 1007, 1061, 1115, 1169, 1313, 1601, 1655, 1919]

function p(t: any, e: any) {
  for (let i = 0; i < e.length; i++) {
    const first = e[i - 1] ? e[i - 1] : 0
    if (t > first && t <= e[i])
      return i + 1
  }
}
export function findImage(article: number) {
  const t = article

  const n = Math.floor(t / 1e5)
  const a = p(n, c)

  const result = `https://basket-${
    (a as number) < 10 ? `0${a}` : a
  }.wb.ru/vol${n}/part${Math.floor(article / 1e3)}/${article}/images/big/1.jpg`
  return result
}

export function findProductCard(article: number) {
  const t = article

  const n = Math.floor(t / 1e5)
  const a = p(n, c)

  const result = `https://basket-${
    (a as number) < 10 ? `0${a}` : a
  }.wb.ru/vol${n}/part${Math.floor(article / 1e3)}/${article}/info/ru/card.json`
  return result
}

export async function findPositionByQuery(query: string, article: number, sort = 'popular') {
  const pages = 30
  const result = {
    found: false,
    page: -1,
    advert: false,
  }

  const advertData: any = await $fetch(`https://catalog-ads.wildberries.ru/api/v6/search?keyword=${query}`, { parseResponse: JSON.parse })
  const advertPages = advertData.pages
  if (advertData.adverts) {
    const foundIndex = advertData.adverts.findIndex((el: any) => el.id === article)
    const foundItem = advertData.adverts.find((el: any) => el.id === article)
    console.log(foundItem)
    if (foundIndex !== -1) {
      const item = advertData.adverts[foundIndex]
      const place = foundIndex + 1
      const page = Math.ceil(place / advertPages[0].count)
      result.found = true
      result.page = page
      result.advert = true
      return result
    }
  }

  for (let i = 1; i <= pages; i++) {
    const data: any = await $fetch(`https://search.wb.ru/exactmatch/ru/male/v4/search?TestGroup=test&TestID=188&appType=1&curr=rub&dest=-1257786&query=${query}&regions=80,38,4,64,83,33,68,70,69,30,86,75,40,1,66,110,22,31,48,71,114&resultset=catalog&sort=${sort}&spp=31&suppressSpellcheck=false&page=${i}`, { parseResponse: JSON.parse })
    const products = data?.data?.products
    if (!products)
      return result

    products.forEach((el: any) => {
      if (el.id === article) {
        result.found = true
        result.page = i
      }
    })
  }
  return result
}
