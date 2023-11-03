import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'


export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { type, period } = getQuery(event)
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('аналитика'))
    return sendRedirect(event, '/auth', 302)

  const currentDate = new Date() // Текущая дата
  let filter: any = {} // Начинаем с пустого фильтраD

  const types = [
    'buyouts service',
    'likes',
    'reviews',
    'questions',
    'productlikes',
    'carts',
    'autoanswers',
  ]

  switch (period) {
    case 'today':
      filter.dataoperation = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        ).setHours(0, 0, 0, 0),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 1
        ).setHours(23, 59, 59, 999),
      }
      break
    case 'yesterday':
      filter.dataoperation = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 1
        ).setHours(0, 0, 0, 0),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        ).setHours(0, 0, 0, 0),
      }
      break
    case 'threeDays':
      const threeDaysAgo = new Date(currentDate)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 2)
      threeDaysAgo.setHours(0, 0, 0, 0)
      filter.dataoperation = {
        $gte: threeDaysAgo,
        $lt: new Date(currentDate).setHours(23, 59, 59, 59),
      }
      break
    case 'week':
      const oneWeekAgo = new Date(currentDate)
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      oneWeekAgo.setHours(0, 0, 0, 0)
      filter.dataoperation = {
        $gte: oneWeekAgo,
        $lt: currentDate,
      }
      break
    case 'month':
      filter.dataoperation = {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1
        ).setHours(0, 0, 0, 0),
      }
      break
    case 'lastMonth':
      filter.dataoperation = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        ),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      }
      break
    case 'thisYear':
      filter.dataoperation = {
        $gte: new Date(currentDate.getFullYear(), 0, 1),
        $lt: new Date(currentDate.getFullYear(), 11, 31),
      }
      break
    case 'lastYear':
      filter.dataoperation = {
        $gte: new Date(currentDate.getFullYear() - 1, 0, 1),
        $lt: new Date(currentDate.getFullYear() - 1, 11, 31),
      }
      break
    default:
      // Обработка неверного значения параметра period, если необходимо
      break
  }

  if (type == 'all') {
    filter.type = {
      $in: types,
    }
  } else {
    filter.type = type
  }

  const history: any = await paymenthistory.find({
    ...filter,
  })

  // const count = history.length
  // let summ = 0
  // history.forEach((item: any) => {
  //   summ += item.summ
  // })
  const format: any = []

  if (
    period == 'week' ||
    period == 'today' ||
    period == 'yesterday' ||
    period == 'threeDays'
  ) {
    const sumByDayArray = new Array(7).fill(0)
    const currentDate: any = new Date()
    currentDate.setDate(currentDate.getDate() + 1)

    const oneWeekAgo = new Date(currentDate)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    oneWeekAgo.setHours(0, 0, 0, 0)

    const daysArray = []
    const date = new Date(oneWeekAgo)
    while (daysArray.length < 7) {
      let curDate: any = date.getDate().toString()
      let month: any = (date.getMonth() + 1).toString()
      curDate = curDate.toString().length == 1 ? '0' + curDate : +curDate
      month = month.toString().length == 1 ? '0' + month : month
      daysArray.push(`${curDate}.${month}`)
      date.setDate(date.getDate() + 1)
    }

    const newHistory: any = await paymenthistory.find({
      type: filter.type,
      dataoperation: {
        $gte: oneWeekAgo,
        $lt: currentDate,
      },
    })

    const trueCurDate: any = new Date()
    trueCurDate.setDate(trueCurDate.getDate() + 1)
    trueCurDate.setHours(0, 0, 0, 0)

    for (const payment of newHistory) {
      const recordDate: any = new Date(payment.dataoperation)

      if (recordDate >= oneWeekAgo && recordDate <= trueCurDate) {
        const daysAgo = Math.floor(
          (trueCurDate - recordDate) / (24 * 60 * 60 * 1000)
        )

        if (daysAgo >= 0 && daysAgo < 7) {
          sumByDayArray[6 - daysAgo] += parseFloat(payment.summ)
        }
      }
    }
    format.data = sumByDayArray
    format.labels = daysArray
  } else if (period == 'month' || period == 'lastMonth') {
    const currentMonth: any = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    )
    const oneMonthAgo = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    )
    if (period == 'lastMonth') {
      currentMonth.setMonth(currentMonth.getMonth() - 1)
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    }

    oneMonthAgo.setHours(0, 0, 0, 0)

    const year = currentDate.getFullYear()
    let month = new Date().getMonth()
    if (period == 'lastMonth') {
      month -= 1
    }
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const numberOfDaysInMonth = lastDayOfMonth.getDate()
    const daysArray = []
    while (daysArray.length < numberOfDaysInMonth) {
      daysArray.push(
        `${
          (oneMonthAgo.getDate() + daysArray.length).toString().length === 1
            ? `0${oneMonthAgo.getDate() + daysArray.length}`
            : oneMonthAgo.getDate() + daysArray.length
        }.${
          (oneMonthAgo.getMonth() + 1).toString().length === 1
            ? `0${oneMonthAgo.getMonth() + 1}`
            : oneMonthAgo.getMonth() + 1
        }`
      )
    }

    const sumByDayArray = new Array(numberOfDaysInMonth).fill(0)
    currentMonth.setHours(0, 0, 0, 0)

    for (const payment of history) {
      const recordDate: any = new Date(payment.dataoperation)

      const daysAgo = Math.floor(
        (currentMonth - recordDate) / (24 * 60 * 60 * 1000)
      )

      if (daysAgo >= 0 && daysAgo < numberOfDaysInMonth) {
        sumByDayArray[numberOfDaysInMonth - 1 - daysAgo] += parseFloat(
          payment.summ
        )
      }
    }
    format.data = sumByDayArray

    format.labels = daysArray
  } else if (period == 'thisYear' || period == 'lastYear') {
    const today =
      period == 'lastYear'
        ? new Date(currentDate.getFullYear() - 1, 0, 1)
        : new Date()
    const thisYear = today.getFullYear()
    const monthsArray = []

    for (let month = 1; month <= 12; month++) {
      const monthString = String(month).padStart(2, '0') // Приведение месяца к формату '01', '02', и т.д.
      monthsArray.push(`${monthString}.${thisYear}`)
    }

    format.labels = monthsArray

    const result = await paymenthistory
      .aggregate([
        {
          $match: {
            type: filter.type,
            dataoperation: {
              $gte: new Date(thisYear, 0, 1),
              $lt: new Date(thisYear + 1, 0, 1),
            },
          },
        },
        {
          $group: {
            _id: { $month: '$dataoperation' }, // Группируем по месяцам
            totalSum: { $sum: '$summ' }, // Суммируем суммы платежей в каждом месяце
          },
        },
        {
          $sort: { _id: 1 }, // Сортируем по месяцам
        },
      ])
      .exec()

    const monthlySums = Array(12).fill(0) // Создаем массив из 12 элементов, заполненных нулями

    result.forEach((item: any) => {
      const monthIndex = item._id - 1 // Месяцы в JS начинаются с 0, а в базе данных - с 1
      monthlySums[monthIndex - 1] = item.totalSum // Устанавливаем сумму в соответствующем месяце
    })
    const lastMonthSumm = monthlySums.pop()
    monthlySums.unshift(lastMonthSumm)
    format.data = monthlySums
  }
  let paymentsForSumm = <any>[]

  paymentsForSumm = await paymenthistory.aggregate([
    {
      $match: {
        dataoperation: filter.dataoperation,
        type: {
          $in: types,
        },
      },
    },
    {
      $group: {
        _id: '$type',
        summ: {
          $sum: '$summ',
        },
        quantity: {
          $sum: 1, // Подсчет количества записей
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ])

  const completedPartnerWithdraws = await PartnerWithdraw.aggregate([
    {
      $match: {
        date: filter.dataoperation,
        status: 'completed',
      },
    },
    {
      $group: {
        _id: 'null',
        summ: {
          $sum: '$amount',
        },
        quantity: {
          $sum: 1, // Подсчет количества записей
        },
      },
    },
  ])

  const activePartnerWithdraws = await PartnerWithdraw.aggregate([
    {
      $match: {
        date: filter.dataoperation,
        status: 'work',
      },
    },
    {
      $group: {
        _id: '$type',
        summ: {
          $sum: '$amount',
        },
        quantity: {
          $sum: 1, // Подсчет количества записей
        },
      },
    },
  ])

  const services = [
    {
      value: 'all',
      title: 'Всего',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'buyouts service',
      title: 'Выкупы',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'reviews',
      title: 'Отзывы',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'likes',
      title: 'Лайки',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'productlikes',
      title: 'Лайки на товар',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'questions',
      title: 'Вопросы',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'carts',
      title: 'Корзина',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'autoanswer',
      title: 'Автоответчик',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'partner full',
      title: 'Выплачено партнерам',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'partner active',
      title: 'Активные выплаты',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'penalty delivery',
      title: 'Штрафы за незабранные товары',
      expenses: 0,
      quantity: 0,
    },
  ]

  if (completedPartnerWithdraws && completedPartnerWithdraws.length > 0) {
    services[8].expenses = completedPartnerWithdraws[0].summ
    services[8].quantity = completedPartnerWithdraws[0].quantity
  }

  if (activePartnerWithdraws && activePartnerWithdraws.length > 0) {
    services[9].expenses = activePartnerWithdraws[0].summ
    services[9].quantity = activePartnerWithdraws[0].quantity
  }

  paymentsForSumm.forEach((item: any) => {
    services[0].expenses = services[0].expenses + item.summ
    services[0].quantity = services[0].quantity + item.quantity
    services.forEach((service: any) => {
      if (service.value == item._id) {
        service.expenses = item.summ
        service.quantity = item.quantity
      }
    })
  })

  const usersCount = await User.countDocuments()
  const oneWeekAgoForAggregate = new Date(currentDate)
  oneWeekAgoForAggregate.setDate(oneWeekAgoForAggregate.getDate() - 7)
  oneWeekAgoForAggregate.setHours(0, 0, 0, 0)

  const activeUsersAggregate = await paymenthistory.aggregate([
    {
      $match: {
        dataoperation: {
          $gte: oneWeekAgoForAggregate,
        },
        type: {
          $in: types,
        },
      },
    },
    {
      $group: {
        _id: '$user', // Группировка по полю "user"
        totalUsers: { $sum: 1 }, // Подсчет уникальных пользователей
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 }, // Подсчет общего количества уникальных пользователей
      },
    },
  ])
  const paidUsersAggregate = await paymenthistory.aggregate([
    {
      $match: {
        type: 'deposit',
      },
    },
    {
      $group: {
        _id: '$user', // Группировка по полю "user"
        totalUsers: { $sum: 1 }, // Подсчет уникальных пользователей
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 }, // Подсчет общего количества уникальных пользователей
      },
    },
  ])
  const activeUsers = activeUsersAggregate[0].count
    ? activeUsersAggregate[0].count
    : 0
  const paidUsers = paidUsersAggregate[0].count
  const inActiveUsers = usersCount - activeUsers

  const pieGraphData = {
    data: [inActiveUsers, paidUsers, activeUsers],
    labels: ['Неактивные', 'Пополняли', 'Активные последнюю неделю'],
    allUsers: usersCount,
  }

  services[3].quantity = Math.floor(Number(services[3].expenses) / 5)
  services[4].quantity = Math.floor(Number(services[4].expenses) / 5)

  const penaltyAggregate = await paymenthistory.aggregate([
    {
      $match: {
        dataoperation: filter.dataoperation,
        typeoperations: 'Расход',
        type: 'deliveries',
        comment: { $regex: 'Штраф', $options: 'i' },
      },
    },
    {
      $group: {
        _id: null,
        summ: { $sum: '$summ' },
        count: { $sum: 1 },
      },
    },
  ])

  services.forEach((service: any) => {
    if (service.value == 'penalty delivery') {
      if (penaltyAggregate && penaltyAggregate[0] && penaltyAggregate[0].summ) {
        service.expenses = penaltyAggregate[0].summ
      }
      if (penaltyAggregate && penaltyAggregate[0] &&penaltyAggregate[0].count) {
        service.quantity = penaltyAggregate[0].count
      }
    }
  })

  return { data: format.data, labels: format.labels, services, pieGraphData }
})
