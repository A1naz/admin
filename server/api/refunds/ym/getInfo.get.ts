import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { Buyout } from '~/server/lib/models/yandexMarket/Buyout'
import { Delivery } from "~/server/lib/models/yandexMarket/Delivery"
import { User } from "~/server/lib/models/User"

export default eventHandler(async (event) => {
        const session = (await getServerSession(event)) as any
        if (!session) return sendRedirect(event, '/auth', 302)
        const user = await AdminUser.findOne({ uuid: session.uuid })
        if (
                !user ||
                (!user.mainAdmin && !user.tabs.includes('возвраты средств клиентам'))
        )
                return sendRedirect(event, '/auth', 302)

        const { actUuid }: any = getQuery(event)

        const foundBuyout = await Buyout.findOne({ uuid: actUuid })
        
        if (!foundBuyout) {
                throw createError({
                        statusCode: 404,
                        message: 'Услуга не найдена',
                })
                
        }

        const foundDelivery = await Delivery.findOne({ uuidbuyout: actUuid })
        const foundUser = await User.findById(foundBuyout.user)

        if (!foundDelivery) {
                throw createError({
                        statusCode: 404,
                        message: 'Доставка не найдена',
                })
        }

        if (!foundUser) {
                throw createError({
                        statusCode: 404,
                        message: 'Пользователь не найден',
                })
        }



        return {
                user: {
                        _id: foundUser._id,
                        uuid: foundUser.uuid,
                        username: foundUser.username,
                        phoneNumber: foundDelivery.recipientphone
                },
                buyout: {
                        operationId: foundBuyout.uuid,
                        operationMongoId: foundBuyout._id
                }
        }
})
