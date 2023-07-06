import fs from 'node:fs'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  if (fs.existsSync('points.json')) {
    const cached = fs.readFileSync('points.json', 'utf8')
    const parsed = JSON.parse(cached)
    const now = new Date()
    const diff = now.getTime() - new Date(parsed.updated).getTime()
    if (diff < 1000 * 60 * 60)
      return sendStream(event, fs.createReadStream('points.json'))
  }
  const data: any = await $fetch(
    'https://www.wildberries.ru/webapi/spa/modules/pickups',
    {
      method: 'GET',
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      },
    },
  )
  const points = data.value.pickups
  const collection = points.map((point: any) => {
    return {
      lt: point.coordinates[0],
      lg: point.coordinates[1],
      w: point.workTime,
      a: point.address,
    }
  })

  const cache = {
    updated: new Date(),
    points: collection,
  }
  fs.writeFileSync('points.json', JSON.stringify(cache))
  return sendStream(event, fs.createReadStream('points.json'))
})
