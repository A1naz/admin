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

        const { id, status }: any = getQuery(event)
        console.log(id, status)
        await BalanceWithdraw.findByIdAndUpdate(id, { status, confirmationDate: status === 'completed' ? Date.now() : null })
        return { status: 'ok' }
})