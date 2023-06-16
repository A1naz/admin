import fs from 'node:fs'

export default async function () {
  if (fs.existsSync('points.json')) {
    const cached = fs.readFileSync('points.json', 'utf8')
    const parsed = JSON.parse(cached)
    const now = new Date()
    const diff = now.getTime() - new Date(parsed.updated).getTime()
    if (diff < 1000 * 60 * 10)
      return parsed
  }
  const data: any = await $fetch(
    'https://www.wildberries.ru/webapi/geo/saveprefereduserloc',
    {
      method: 'GET',
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      },
    },
  )
  const points = data.value.pickups
  const ids = points.map((point: any) => point.id)

  const info: any = await $fetch(
    'https://www.wildberries.ru/webapi/poo/byids',
    {
      method: 'POST',
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      },
      body: JSON.stringify(ids),
    },
  )
  const collection = points.map((point: any) => {
    const infoPoint = info.value[point.id]
    return {
      lt: point.coordinates[0],
      lg: point.coordinates[1],
      w: infoPoint.workTime,
      a: infoPoint.address,
    }
  })

  const cache = {
    updated: new Date(),
    points: collection,
  }
  fs.writeFileSync('points.json', JSON.stringify(cache))
  return cache
}
