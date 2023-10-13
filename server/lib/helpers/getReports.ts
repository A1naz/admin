import { User } from '../models/User'
import { Buyout } from '../models/Buyout'
import { Report } from '../models/Report'
export default async function getReports(
  userId: string,
  status: string,
  page: any
) {
  const statusObj =
    status == 'any'
      ? {}
      : status == 'work'
      ? { status: { $in: ['created', 'working', 'waiting', 'work'] } }
      : { status: status }

  const user = await User.findById(userId)
  const reports: any = await Report.find({ user })
    .sort({ createdAt: -1 })
    .skip((page - 1) * 50)
    .limit(50)

  const count = await Report.count({ user })

  const format = await Promise.all(
    reports.map(async (report: any) => {
      const date = new Date(report.date)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0') // Месяцы в JavaScript начинаются с 0, поэтому прибавляем 1
      const year = date.getFullYear()
      const formattedDate = day + '.' + month + '.' + year

      const buyout = await Buyout.findById(report.buyout)

      return {
        ...report._doc,
        trueDate: formattedDate,
        uuidbuyout: buyout?.uuid,
      }
    })
  )

  return { info: format, count }
}
