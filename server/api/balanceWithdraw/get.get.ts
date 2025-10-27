import { AdminUser } from '~~/server/lib/models/AdminUser'
import { BalanceWithdraw } from '~~/server/lib/models/BalanceWithdraw'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
        const session = (await getServerSession(event)) as any
        if (!session) return sendRedirect(event, '/auth', 302)
        const user = await AdminUser.findOne({ uuid: session.uuid })
        if (
                !user ||
                (!user.mainAdmin && !user.tabs.includes('вывод с баланса'))
        )
                return sendRedirect(event, '/auth', 302)

        const { page, status }: any = getQuery(event)
        const findQuery: any = {}
        if (status && status !== 'all') {
                findQuery.status = status
        }
        const history = await BalanceWithdraw.find(findQuery)
                .sort({ _id: -1 })
                .skip((page - 1) * 50)
                .limit(50)
        return history
})