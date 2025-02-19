import { Buyout as WildberrisBuyout } from '~/server/lib/models/Buyout'
import { Buyout as OzonBuyout } from '~/server/lib/models/ozon/Buyout'
import { Buyout as YandexMarketBuyout } from '~/server/lib/models/yandexMarket/Buyout'
import { Buyout as AvitoBuyout } from '~/server/lib/models/avito/Buyout'
import { paymenthistory } from "~/server/lib/models/Paymenthistory"
import { User } from "~/server/lib/models/User"
import getServiceName from "./getServiceName"

export default async function (trueFilters: any, mp: string, skip: number, limit: number) {

        const history = await paymenthistory.find({
                user: trueFilters.clients && trueFilters.clients.length ?
                        {
                                $in: trueFilters.clients
                        } : { $exists: true },
                dataoperation: trueFilters.dateRange ?
                        {
                                $gte: new Date(trueFilters.dateRange[0]).setHours(0, 0, 0, 0),
                                $lt: new Date(trueFilters.dateRange[1]).setHours(23, 59, 0, 0),
                        } : { $exists: true },
                mp: mp === 'all' ? { $exists: true } : mp
        }).skip(skip).limit(limit)

        const users = await User.find({
                _id: history.map((item: any) => item.user)
        }).select(
                '_id uuid username email'
        )

        const wildberriesBuyoutUuids: string[] = []
        const ozonBuyoutUuids: string[] = []
        const yandexMarketBuyoutUuids: string[] = []
        const avitoBuyoutUuids: string[] = []


        history.forEach((item: any) => {
                if ((item.type === 'buyouts' || item.type === 'buyouts service') && item.basisoperation && item.basisoperation.includes('Выкуп #')) {

                        if (item.mp && item.mp === 'wildberries') {
                                wildberriesBuyoutUuids.push(item.basisoperation.split('Выкуп #')[1])
                        } else
                                if (item.mp && item.mp === 'ozon') {
                                        ozonBuyoutUuids.push(item.basisoperation.split('Выкуп #')[1])
                                } else
                                        if (item.mp && item.mp === 'yandexmarket') {
                                                yandexMarketBuyoutUuids.push(item.basisoperation.split('Выкуп #')[1])
                                        } else
                                                if (item.mp && item.mp === 'avito') {
                                                        avitoBuyoutUuids.push(item.basisoperation.split('Выкуп #')[1])
                                                }
                }

        })

        const wildberriesBuyouts = await WildberrisBuyout.find({
                uuid: { $in: wildberriesBuyoutUuids }
        })

        const ozonBuyouts = await OzonBuyout.find({
                uuid: { $in: ozonBuyoutUuids }
        })

        const yandexMarketBuyouts = await YandexMarketBuyout.find({
                uuid: { $in: yandexMarketBuyoutUuids }
        })

        const avitoBuyouts = await AvitoBuyout.find({
                uuid: { $in: avitoBuyoutUuids }
        })

        const allBuyouts = [...wildberriesBuyouts, ...ozonBuyouts, ...yandexMarketBuyouts, ...avitoBuyouts]

        const format: any[] = []

        for (const item of history) {
                if ((item.type === 'buyouts' || item.type === 'buyouts service') && item.basisoperation && item.basisoperation.includes('Выкуп #')) {
                        const buyout = allBuyouts.find(buyout => buyout.uuid === item.basisoperation.split('Выкуп #')[1])
                        const foundUser = users.find(user => user._id.valueOf() === item.user.valueOf())

                        format.push({
                                _id: item._id,
                                userUuid: foundUser ? foundUser.uuid : '',
                                email: foundUser ? foundUser.email : '',
                                username: foundUser ? foundUser.username : '',
                                mp: item.mp,
                                summ: item.summ,
                                typeoperations: item.typeoperations,
                                basisoperation: item.basisoperation,
                                comment: item.comment,
                                dataoperation: item.dataoperation,
                                productName: buyout ? buyout.product.name : '',
                                article: buyout ? buyout.article : '',
                                serviceName: getServiceName(item.type)
                        })

                } else {
                        const foundUser = users.find(user => user._id.valueOf() === item.user.valueOf())
                        format.push({
                                _id: item._id,
                                userUuid: foundUser ? foundUser.uuid : '',
                                email: foundUser ? foundUser.email : '',
                                username: foundUser ? foundUser.username : '',
                                mp: item.mp,
                                summ: item.summ,
                                typeoperations: item.typeoperations,
                                basisoperation: item.basisoperation,
                                comment: item.comment,
                                dataoperation: item.dataoperation,
                                productName: '',
                                article: '',
                                serviceName: getServiceName(item.type)
                        })
                }
        }



        return format
}