import * as https from 'https'
import { HttpsProxyAgent } from 'https-proxy-agent'
const c = [143, 287, 431, 719, 1007, 1061, 1115, 1169, 1313, 1601, 1655, 1919]
import { proxies } from './proxy'

function p(t: any, e: any) {
  for (let i = 0; i < e.length; i++) {
    const first = e[i - 1] ? e[i - 1] : 0
    if (t > first && t <= e[i]) return i + 1
  }
}
const sleep = (ms: any) => new Promise((r) => setTimeout(r, ms))

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

const cycleCount = 0
export async function findPositionByQuery(
  query: string,
  article: number,
  sort = 'popular',
  n: number = 0,
  cycleCount: number = 0
) {
  const pages = 50
  try {
    const result = {
      found: false,
      page: -1,
      advert: false,
    }

    const randomNumber = Math.floor(Math.random() * 105)

    const advertData: any = await $fetch(
      `https://catalog-ads.wildberries.ru/api/v6/search?keyword=${query}`,
      {
        agent: new HttpsProxyAgent(`${proxies[randomNumber]}`),
        parseResponse: JSON.parse,
      }
    )
    const advertPages = advertData.pages
    if (advertData.adverts) {
      const foundIndex = advertData.adverts.findIndex(
        (el: any) => el.id === article
      )
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

    async function findPositionCycle() {
      for (let i = n; i <= pages; i++) {
        n++
        const random = Math.floor(Math.random() * 105)

        const data: any = await $fetch(
          `https://search.wb.ru/exactmatch/ru/male/v4/search?TestGroup=test&TestID=188&appType=1&curr=rub&dest=-1257786&query=${query}&regions=80,38,4,64,83,33,68,70,69,30,86,75,40,1,66,110,22,31,48,71,114&resultset=catalog&sort=${sort}&spp=31&suppressSpellcheck=false&page=${i}`,
          {
            method: 'GET',
            agent: new HttpsProxyAgent(`${proxies[random]}`),
          }
        )

        const parsed = JSON.parse(data)
        const products = parsed?.data?.products

        if (!products) return result

        products.forEach((el: any) => {
          if (el.id === article) {
            result.found = true
            result.page = i
            return result
          }
        })
        if (result.found) return result
      }
      return result
    }

    if (n < pages) {
      const cycleResult = await findPositionCycle()
      return cycleResult
    } else return result
  } catch (e) {
    cycleCount++
    if (n <= 1) {
      const newResult: any = await findPositionByQuery(query, article, sort, n)
      return newResult
    } else if (n < pages && cycleCount < 10) {
      await sleep(5000)
      const newResult: any = await findPositionByQuery(
        query,
        article,
        sort,
        n,
        cycleCount
      )
      return newResult
    }
    const result = {
      found: false,
      page: -1,
      advert: false,
    }

    return result
  }
}
