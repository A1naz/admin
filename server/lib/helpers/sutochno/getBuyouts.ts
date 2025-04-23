import { Buyout } from '~/server/lib/models/sutochno/Buyout'
import { User } from '~/server/lib/models/User'

export default async function getBuyouts(
  userId: string,
  status: string,
  page: any,
  serviceId: any
) {
  let serviceIdFilter: any = {}
  if (serviceId) {
    const trueServiceId = serviceId.replaceAll('#', '')
    serviceIdFilter = {
      uuid: trueServiceId,
    }
  }

  const statusObj = status == 'any' ? {} : { status: status }
  const user = await User.findById(userId)
  const buyouts: any = await Buyout.find({
    user,
    ...statusObj,
    ...serviceIdFilter,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * 50)
    .limit(50)

  const count = await Buyout.count({ user })

  const format = buyouts.map((buyout: any) => {
    const date = new Date(buyout.createdAt)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // Месяцы в JavaScript начинаются с 0, поэтому прибавляем 1
    const year = date.getFullYear()
    const formattedDate = day + '.' + month + '.' + year
    const dateRange =
      buyout.dateStart.toISOString().split('T')[0] +
      ' - ' +
      buyout.dateEnd.toISOString().split('T')[0]
    return {
      ...buyout._doc,
      trueDate: formattedDate,
      dateRange,
    }
  })

  return { info: format, count }
}
