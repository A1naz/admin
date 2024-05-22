import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Buyoutlog } from '@/server/lib/models/ozon/Buyoutlog'

export default eventHandler(async (event) => {
  const { lt, lg } = getQuery(event)

  const data: any = await $fetch(
    `https://opp-api.ozon.ru/task/creation-availability?location.lat=${lt}&location.lon=${lg}&layer=PvzGroup`
  )

  return data.geocode.fullText || 'Не удалось определить адрес'
})
