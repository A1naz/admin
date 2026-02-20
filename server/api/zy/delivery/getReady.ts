import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Delivery } from '@/server/lib/models/zy/Delivery'
import { Buyout } from '@/server/lib/models/zy/Buyout'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ActionHistory } from '@/server/lib/models/actionHistory'
const prefixesToRemove =
  /(г\.?|д\.?|с\.?|село|п\.?|пос\.?|посёлок|дер\.?|деревня|поселок городского типа|посёлок станции)\s*/gi

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

  // if (!adminUser.isAllUsersAllowed) {
  //   const allowedUsersParam = adminUser.allowedUsers.map(
  //     (item: any) => item.valueOf
  //   )
  //   const restrictedUsersParam = adminUser.restrictedUsers.map(
  //     (item: any) => item.valueOf
  //   )

  //   if (
  //     !allowedUsersParam.includes(user._id.valueOf()) ||
  //     restrictedUsersParam.includes(user._id.valueOf())
  //   ) {
  //     throw createError({
  //       statusCode: 400,
  //       message: 'Пользователь не разрешен',
  //     })
  //   }
  // }

  const all = await Delivery.find({
    user: { $in: user.map((item) => item._id) },
    point: (pvzArray && pvzArray.length > 0)? { $in: pvzArray } : { $exists: true },
  })

  const buyoutsId = all.map(item => item.idbuyout);
  const buyouts = await Buyout.find({ _id: { $in: buyoutsId } })

  const format = await Promise.all(
    all.map(async (delivery) => {
      const buyout = buyouts.find((item:any) => item._id.valueOf() === delivery.idbuyout.valueOf())
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
      if (item)
        return (
          item!.currentstatus === 'Готов к выдаче' ||
          item!.currentstatus === 'Готов к получению' || 
          item!.currentstatus.includes('Заберите до')
        )
      else return false
    })
    .sort((a: any, b: any) =>
      a.point
        .replace(prefixesToRemove, '')
        .replace(/[^а-яё]/gi, '')
        .localeCompare(
          b.point.replace(prefixesToRemove, '').replace(/[^а-яё]/gi, ''),
          'ru',
          {
            sensitivity: 'accent',
          }
        )
    )

  const points = {} as any
  filtered.forEach((item, index) => {
    if (points[item!.point]) points[item!.point].push(item)
    else points[item!.point] = [item]
  })

  return points
})
