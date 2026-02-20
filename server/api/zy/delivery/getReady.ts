import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Delivery } from '@/server/lib/models/zy/Delivery'
import { Buyout } from '@/server/lib/models/zy/Buyout'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ActionHistory } from '@/server/lib/models/actionHistory'

/**
 * Нормализует адрес для сортировки, убирая префиксы населенных пунктов
 */
function normalizeAddressForSorting(address: string): string {
  if (!address) return ''

  const prefixes = [
    'г\\.',
    'город',
    'г ',
    'д\\.',
    'деревня',
    'д ',
    'с\\.',
    'село',
    'с ',
    'пос\\.',
    'посёлок',
    'поселок',
    'пгт\\.',
    'ст\\.',
    'станица',
    'хутор',
    'аул',
    'рп\\.',
  ]

  const regex = new RegExp(`^\\s*(${prefixes.join('|')})\\s*`, 'i')
  return address.replace(regex, '').trim().toLowerCase()
}

export default eventHandler(async (event) => {
  const { uuid, pvzs }: any = getQuery(event)

  const uuidArray = JSON.parse(uuid) as string[]
  const pvzArray = JSON.parse(pvzs)
  const session = (await getServerSession(event)) as any
  const adminUser = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !adminUser ||
    (!adminUser.mainAdmin &&
      !adminUser.tabs.includes('товары готовые к выдаче'))
  )
    return sendRedirect(event, '/auth', 302)

  const user = await User.find({ uuid: { $in: uuidArray } })

  if (!user || !user.length) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }

  await ActionHistory.create({
    adminUser: adminUser._id,
    userUuids: uuidArray,
    actionId: 101,
    actionDescription: `Админ ${adminUser.uuid} - ${adminUser.username} экспорт общей таблицы excel`,
    date: new Date(),
  })

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const all = await Delivery.find({
    user: { $in: user.map((item) => item._id) },
    point: pvzArray && pvzArray.length > 0 ? { $in: pvzArray } : { $exists: true },
    statusdelivery: {
      $elemMatch: {
        $or: [
          { status: 'Готов к выдаче' },
          { status: 'готов к выдаче' },
          { status: 'Готов к получению' },
          { status: { $regex: '^Готов к выдаче.*' } },
          { status: { $regex: '^готов к выдаче.*' } },
          { status: { $regex: '^Готов к получению.*' } },
          { status: { $regex: '^Заберите до.*' } },
          { status: { $regex: '^Получите до.*' } },
          { status: { $regex: '^Ждёт.*' } },
        ],
      },
    },
    updatedAt: { $gte: todayStart },
  })

  const buyoutsId = all.map(item => item.idbuyout)
  const buyouts = await Buyout.find({ _id: { $in: buyoutsId } })

  const format = await Promise.all(
    all.map(async (delivery) => {
      const buyout = buyouts.find((item: any) => item._id.valueOf() === delivery.idbuyout.valueOf())
      if (!buyout) return null
      const place = all.findIndex(
        (item) => item._id.toString() === delivery._id.toString()
      )

      const phone = delivery.recipientphone || ''
      const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`
      const currentstatus = delivery.statusdelivery?.length
        ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status
        : 'Неизвестно'
      const statusupdated = delivery.statusdelivery?.length
        ? new Date(
            delivery.statusdelivery[delivery.statusdelivery.length - 1].date
          )
        : new Date()

      let username = ''

      user.forEach((el: any) => {
        if (el._id.valueOf() === buyout.user.valueOf()) {
          username = el.username
        }
      })

      return {
        place: place + 1,
        uuid: buyout.uuid,
        article: delivery.article,
        pricebuy: delivery.pricebuy,
        size: buyout.sizeparam,
        username,
        point: delivery.point,
        statusdelivery: delivery.statusdelivery,
        currentstatus,
        statusupdated,
        productname: buyout.product.name,
        productimage: buyout.product.image,
        receiptcode: delivery.receiptcode ? delivery.receiptcode : undefined,
        receiptcodeqr: delivery.receiptcodeqr
          ? delivery.receiptcodeqr
          : undefined,
        recipient: delivery.recipient,
        recipientphone: replaced,
        updatedAt: delivery.updatedAt,
      }
    })
  )

  const filtered = format
    .filter((item) => {
      if (!item) return false
      const s = item.currentstatus
      return (
        s === 'Готов к выдаче' ||
        s === 'готов к выдаче' ||
        s === 'Готов к получению' ||
        s.includes('готов к выдаче') ||
        s.includes('Готов к выдаче') ||
        s.includes('Заберите до') ||
        s.includes('Получите до') ||
        s.includes('Ждёт')
      )
    })
    .sort((a: any, b: any) => {
      const addressA = normalizeAddressForSorting(a.point || '')
      const addressB = normalizeAddressForSorting(b.point || '')
      return addressA.localeCompare(addressB, 'ru')
    })

  const points = {} as any
  filtered.forEach((item) => {
    if (points[item!.point]) points[item!.point].push(item)
    else points[item!.point] = [item]
  })

  return points
})
