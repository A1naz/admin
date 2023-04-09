import fs from 'node:fs'
import type { Storage } from 'unstorage'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const storage: Storage = await useStorage('db')
  if (fs.existsSync('point.json')) {
    const cached = fs.readFileSync('points.json', 'utf8')
    const parsed = JSON.parse(cached)
    const now = new Date()
    const diff = now.getTime() - new Date(parsed.updated).getTime()
    await storage.setItem('points', parsed)
    if (diff < 1000 * 60 * 60)
      return sendStream(event, fs.createReadStream('points.json'))
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
  // const features = points.map((point: any, index: number) => {
  // 	const infoPoint = info.value[point.id];
  // 	return {
  // 		type: "Feature",
  // 		id: point.id,
  // 		geometry: {
  // 			type: "Point",
  // 			coordinates: point.coordinates,
  // 		},
  // 		properties: {
  // 			data: {
  // 				workTime: infoPoint.workTime,
  // 				address: infoPoint.address,
  // 			},
  // 		},
  // 	};
  // });
  // const format = {
  // 	type: "FeatureCollection",
  // 	features,
  // };
  const collection = points.map((point: any, index: number) => {
    const infoPoint = info.value[point.id]
    return {
      lt: point.coordinates[0],
      lg: point.coordinates[1],
      w: infoPoint.workTime,
      a: infoPoint.address,
    }
  })

  const format = {
    type: 'FeatureCollection',
    features: collection,
  }
  const cache = {
    updated: new Date(),
    points: collection,
  }
  await storage.setItem('points', cache)
  fs.writeFileSync('points.json', JSON.stringify(cache))
  return sendStream(event, fs.createReadStream('points.json'))
})
