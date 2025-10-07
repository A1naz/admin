import ExcelJS from 'exceljs'
import { Service } from '~/server/lib/models/Service'
import { User } from '~/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('запросы направлений')))
    return sendRedirect(event, '/auth', 302)

  const { type, underType, query } = await readBody(event)

  const services = await Service.find({
    type: underType === 'any' ? { $exists: true } : underType,
    name: { $regex: query, $options: 'i' },
  })

  const usersWhoVoted = await User.find({
    votedFor: { $exists: true, $ne: [] },
  }).select('votedFor username')

  const exportData: any[] = []

  services.forEach((service) => {
    usersWhoVoted.forEach((user) => {
      if (user.votedFor.includes(service.slug)) {
        exportData.push({
          slug: service.slug, // Наименование
          type: service.type, // Категория
          name: service.name, // Услуга
          login: user.username, // Логин юзера
        })
      }
    })
  })

  exportData.sort((a, b) => a.slug.localeCompare(b.slug))

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Запросы направлений')

  sheet.columns = [
    { header: 'Наименование', key: 'slug', width: 32 },
    { header: 'Категория', key: 'type', width: 20 },
    { header: 'Услуга', key: 'name', width: 32 },
    { header: 'Логин юзера', key: 'login', width: 20 },
  ]

  sheet.addRows(exportData)

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
})
