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
