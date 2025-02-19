import { paymenthistory } from "~/server/lib/models/Paymenthistory"
import { User } from "~/server/lib/models/User"
import getServiceName from "./getServiceName"

export default async function (trueFilters: any, mp: string, skip: number, limit: number) {

        const history = await paymenthistory.find({
                comment: {
                        $regex: 'Штраф',
                },
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


        console.log(history.length)

        const users = await User.find({
                _id: history.map((item: any) => item.user)
        }).select(
                '_id uuid username email'
        )


        const format: any[] = []

        for (const item of history) {

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
                        serviceName: getServiceName(item.type)

                })
        }



        return format
}