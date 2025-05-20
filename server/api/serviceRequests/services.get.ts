import { Service } from "~/server/lib/models/Service";
import { User } from "~/server/lib/models/User";
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'

function getServiceNameByKey(key: string) {
        switch (key) {
          case 'buyouts':
            return 'Выкупы'
          case 'deliveries':
            return 'Доставки'
          case 'reviews':
            return 'Отзывы'
          case 'likes':
            return 'Лайки отзывов'
          case 'questionlikes':
            return 'Лайки вопросов'
          case 'likeProduct':
            return 'Лайки продуктов'
          case 'questions':
            return 'Вопросы продуктов'
          case 'carts':
            return 'Корзина'
          case 'viewings':
            return 'Просмотры'
          case 'autoAnswer':
            return 'Автоответчик'
          case 'partnerRewardPercent':
            return 'Бонус партнерки %'
          case 'partnerSecondLevelPercent':
            return 'Бонус партнерки 2 уровня %'
          case 'HotelsBuyouts':
            return 'Бронирование отелей'
          case 'reviewRemoving':
            return 'Удаление отзывов'
          case 'Hotelsreview':
            return 'Отзывы отелей'
          case 'penalty':
            return 'Штрафы'
        }
        return key
      }

export default defineEventHandler(async (event) => {

      const session = (await getServerSession(event)) as any
         if (!session) return sendRedirect(event, '/auth', 302)
         const user = await AdminUser.findOne({ uuid: session.uuid })
        if (!user || (!user.mainAdmin && !user.tabs.includes('запросы направлений')))
           return sendRedirect(event, '/auth', 302)

        const { type, query } = getQuery(event)

        const services = await Service.find({
                name: { $regex: query, $options: 'i' },
        })

        const usersVotes: any = await User.find({
                votedFor: { $exists: true },
        }).select('votedForService')

        const userVotesMap = new Map();
        for (const vote of usersVotes) {
                for (const votedFor of vote.votedForService) {

                        if (userVotesMap.has(votedFor.mp + votedFor.slug)) {
                                userVotesMap.set(votedFor.mp + votedFor.slug, userVotesMap.get(votedFor.mp + votedFor.slug) + 1);
                        } else {
                                userVotesMap.set(votedFor.mp + votedFor.slug, 1);
                        }
                }
        }

        const array = Array.from(userVotesMap.entries());

        const format = array.map((vote) => {
                const foundService = services.find((service) => service.slug === vote[0].split('/')[0]);

                return {
                        type: foundService?.type,
                        slug: foundService?.slug,
                        name: getServiceNameByKey(vote[0].split('/')[1]),
                        votes: vote[1],
                }
        }).filter((item) => item.slug !== undefined)

        return format
}
)