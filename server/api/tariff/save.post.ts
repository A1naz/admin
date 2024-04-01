import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { Buyout } from '@/server/lib/models/Buyout'
import { Delivery } from '~~/server/lib/models/Delivery'
import { ActionHistory } from '~/server/lib/models/actionHistory'

function getServiceNameByKey(key: string) {
  switch (key) {
    case 'buyouts':
      return 'Выкупы'
    case 'deliveryStorage':
      return 'Доставки'
    case 'review':
      return 'Отзывы'
    case 'likeReview':
      return 'Лайки отзывов'
    case 'likeProduct':
      return 'Лайки продуктов'
    case 'questionProduct':
      return 'Вопросы продуктов'
    case 'cart':
      return 'Корзина'
    case 'autoAnswer':
      return 'Автоответчик'
    case 'partnerRewardPercent':
      return 'Бонус партнерки %'
    case 'partnerSecondLevelPercent':
      return 'Бонус партнерки 2 уровня %'
    case 'HotelsBuyouts':
      return 'Бронирование отелей'
    case 'reviewRemoving':
      return 'Удаление отзывов'
    case 'Hotelsreview':
      return 'Отзывы отелей'
  }
}

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { userUuid, tariffs }: any = await readBody(event)
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('запросы скриншотов')))
    return sendRedirect(event, '/auth', 302)

  const foundUser: any = await User.findOne({
    uuid: userUuid,
  })

  if (!foundUser) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }

  foundUser.MPTariffs = tariffs
  let tariffsStr = ''
  tariffs.forEach((item: any) => {
    let pricesStr = `  ${item.mp.toUpperCase()}: \n `
    let index = 0

    for (let key in item.prices) {
      index++
      const symbol = index >= Object.keys(item.prices).length ? '. ' : ', '
      const valueSymbol = item.prices[key].type == 'percent' ? '%' : '₽'
      pricesStr =
        pricesStr +
        ' - ' +
        getServiceNameByKey(key.toString()) +
        ': ' +
        item.prices[key].value +
        valueSymbol +
        symbol + '\n'
    }

    tariffsStr += pricesStr + '\n'
  })

  await foundUser.save()

  await ActionHistory.create({
    adminUser: user._id,
    adminUserUuid: user.uuid,
    actionId: 92,
    actionDescription: ` Тарифы пользователя ${foundUser.username} были изменены на значения:\n${tariffsStr}`,
    date: new Date(),
    userUuid: foundUser.uuid,
  })

  return {
    status: 'ok',
  }
})
