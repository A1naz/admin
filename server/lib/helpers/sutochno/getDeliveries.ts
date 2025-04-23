import { Delivery } from '~/server/lib/models/sutochno/Delivery'
import { User } from '~/server/lib/models/User'

export default async function getDeliveries(
  userId: string,
  status: string,
  page: any,
  serviceId: any
) {
  const statusObj =
    status == 'any'
      ? {}
      : status == 'ready'
      ? {
          status: 'active',
          $expr: {
            $in: [
              { $arrayElemAt: ['$statusdelivery.status', -1] },
              ['Готов к получению', 'Готов к выдаче', 'Ожидает получения'],
            ],
          },
        }
        : status == 'canceled'
        ? { 
            $expr: {
              $in: [
                { $arrayElemAt: ['$statusdelivery.status', -1] },
                [ 'Возврат', 'Отмена магазином', 'Возврат средств', 'Отменён', 'Отменен'],        
              ],
            },
          }
        : { status: status }

  let serviceIdFilter: any = {}
  if (serviceId) {
    const trueServiceId = serviceId.replaceAll('#', '')
    serviceIdFilter = {
      uuidbuyout: trueServiceId,
    }
  }
  const user = await User.findById(userId)
  const deliveries: any = await Delivery.find({
    user,
    ...statusObj,
    ...serviceIdFilter,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * 50)
    .limit(50)

  const count = await Delivery.count({ user })

  const format: any = deliveries.map((delivery: any) => {
    const date = new Date(delivery.updatedAt)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // Месяцы в JavaScript начинаются с 0, поэтому прибавляем 1
    const year = date.getFullYear()
    const formattedDate = day + '.' + month + '.' + year
    return {
      ...delivery._doc,
      trueDate: formattedDate,
    }
  })

  return { info: format, count }
}
