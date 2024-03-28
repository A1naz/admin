import { getServerSession } from '#auth'
import { DefaultPrices } from '~/server/lib/models/defaultPrices'


export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const defaultPrices = await DefaultPrices.findOne()
  

  return defaultPrices?.values
})
