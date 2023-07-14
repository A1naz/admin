export function findImage(article: number) {
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

export function findProductCard(article: number) {
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
  }.wb.ru/vol${n}/part${Math.floor(article / 1e3)}/${article}/info/ru/card.json`
  return result
}
