import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import fs from 'fs/promises'
import path from 'path'

const dataPath = path.join(process.cwd(), 'server', 'nds_data.json')

async function getNDSData() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(data)
  } catch (e: unknown) {
    const error = e as { code: string };
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

async function saveNDSData(data: any) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8')
}

async function calculateTurnoverForMonth(year: number, month: number) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 1)

  const dateQuery = { $gte: startDate, $lt: endDate }

  let manualTurnover = 0
  const handleTurnOverSumm = await paymenthistory.aggregate([
    {
      $match: {
        dataoperation: dateQuery,
        typeoperations: 'Приход',
        comment: { $regex: 'Ручное пополнение' },
      },
    },
    {
      $group: {
        _id: null,
        summ: {
          $sum: '$summ',
        },
      },
    },
  ])

  if (handleTurnOverSumm && handleTurnOverSumm.length > 0) {
    manualTurnover = handleTurnOverSumm[0].summ
  }

  let qrTurnover = 0
  const qrTurnoverSumm = await paymenthistory.aggregate([
    {
      $match: {
        dataoperation: dateQuery,
        typeoperations: 'Приход',
        comment: { $regex: 'Пополнение ' },
      },
    },
    {
      $group: {
        _id: null,
        summ: {
          $sum: '$summ',
        },
      },
    },
  ])

  if (qrTurnoverSumm && qrTurnoverSumm.length > 0) {
    qrTurnover = qrTurnoverSumm[0].summ
  }

  return { manualTurnover, qrTurnover }
}

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('статистика')))
    return sendRedirect(event, '/auth', 302)

  const storedData = await getNDSData()

  const lastStoredEntry = storedData.length > 0 ? storedData[storedData.length - 1] : null
  
  let startDate = new Date('2025-08-01')
  if (lastStoredEntry) {
    startDate = new Date(lastStoredEntry.year, lastStoredEntry.monthIndex + 1, 1)
  }
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Calculate for months between last stored and current month
  while (startDate < new Date(today.getFullYear(), today.getMonth(), 1)) {
    const year = startDate.getFullYear()
    const month = startDate.getMonth()

    const { manualTurnover, qrTurnover } = await calculateTurnoverForMonth(year, month)

    if (manualTurnover > 0 || qrTurnover > 0) {
        const manualNds = (manualTurnover * 5) / 105
        const qrNds = (qrTurnover * 5) / 105
        const totalNds = manualNds + qrNds
    
        storedData.push({
            month: `${startDate.toLocaleString('ru-RU', { month: 'long' })} ${year}`,
            year,
            monthIndex: month,
            qrNds,
            manualNds,
            totalNds,
        })
    }
    
    startDate.setMonth(startDate.getMonth() + 1)
  }

  await saveNDSData(storedData)

  // Calculate for current month but don't store it
  const currentMonthData = [...storedData]
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  const lastDataYear = lastStoredEntry ? lastStoredEntry.year : 0;
  const lastDataMonth = lastStoredEntry ? lastStoredEntry.monthIndex : -1;

  if(currentYear > lastDataYear || (currentYear === lastDataYear && currentMonth > lastDataMonth)) {
    const { manualTurnover, qrTurnover } = await calculateTurnoverForMonth(currentYear, currentMonth)
  
    if (manualTurnover > 0 || qrTurnover > 0) {
        const manualNds = (manualTurnover * 5) / 105
        const qrNds = (qrTurnover * 5) / 105
        const totalNds = manualNds + qrNds
    
        currentMonthData.push({
            month: `${today.toLocaleString('ru-RU', { month: 'long' })} ${currentYear} (текущий)`,
            year: currentYear,
            monthIndex: currentMonth,
            qrNds,
            manualNds,
            totalNds,
        })
    }
  }


  return currentMonthData
})
