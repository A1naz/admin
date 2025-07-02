import fs from 'node:fs'
import { PVZ } from '~/server/lib/models/wildberries/PVZ'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  if (!session) return sendRedirect(event, '/auth', 302)
  if (fs.existsSync('pvz/wildberriesPoints.json')) {
    const cached = fs.readFileSync('pvz/wildberriesPoints.json', 'utf8')
    const parsed = JSON.parse(cached)

    const now = new Date()
    const diff = now.getTime() - new Date(parsed.updated).getTime()
    if (diff < 1000 * 60 * 60) {
      return sendStream(
        event,
        fs.createReadStream('pvz/wildberriesPoints.json')
      )
    }
  }

  const points: any = await PVZ.find()

  const collection = points.map((point: any) => {
    return {
      id: point.pointId,
      lt:
        point.coordinates && point.coordinates[0] ? point.coordinates[0] : null,
      lg:
        point.coordinates && point.coordinates[1] ? point.coordinates[1] : null,
      a: point.address,
    }
  })

  const cache = {
    updated: new Date(),
    points: collection,
  }
  fs.writeFileSync('pvz/wildberriesPoints.json', JSON.stringify(cache))
  return sendStream(event, fs.createReadStream('pvz/wildberriesPoints.json'))
})
