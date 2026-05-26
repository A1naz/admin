import { Service } from "~/server/lib/models/Service";
import { User } from "~/server/lib/models/User";
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

export default defineEventHandler(async (event) => {
       const session = (await getServerSession(event)) as any
       if (!session) return sendRedirect(event, '/auth', 302)
       const user = await AdminUser.findOne({ uuid: session.uuid })
        if (!user || (!user.mainAdmin && !user.tabs.includes('запросы направлений')))
         return sendRedirect(event, '/auth', 302)

        const { type, query } = getQuery(event)
    
        // ✅ FIX: Санитизация query для защиты от ReDoS
        const safeQuery = sanitizeSearchQuery(query || '', 100)

        const services = await Service.find({
                type: type === 'any' ? { $exists: true } : type,
                name: { $regex: safeQuery, $options: 'i' },
        })

        const usersVotes: any = await User.find({
                votedFor: { $exists: true },
        }).select('votedFor')

        const userVotesMap = new Map();
        for (const vote of usersVotes) {
                for (const votedFor of vote.votedFor) {

                        if (userVotesMap.has(votedFor)) {
                                userVotesMap.set(votedFor, userVotesMap.get(votedFor) + 1);
                        } else {
                                userVotesMap.set(votedFor, 1);
                        }
                }
        }

        const array = Array.from(userVotesMap.entries());
        const format = array.map((vote) => {
                const foundService = services.find((service) => service.slug === vote[0]);
                return {
                        type: foundService?.type,
                        slug: foundService?.slug,
                        name: foundService?.name,
                        votes: vote[1],
                }
        }).filter((item) => item.slug !== undefined)

        return format.sort((a, b) => b.votes - a.votes)
}
)