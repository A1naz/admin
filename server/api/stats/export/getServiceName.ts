export default function getServiceNameByKey(key: string | undefined) {
        switch (key) {
                case 'buyouts':
                        return 'Выкупы'
                case 'buyouts service':
                        return 'Услуга выкупа'
                case 'deliveryStorage':
                        return 'Доставки'
                case 'review':
                        return 'Отзывы'
                case 'likeReview':
                        return 'Лайки отзывов'
                case 'likeProduct':
                        return 'Лайки продуктов'
                case 'questionProduct':
                        return 'Вопросы продуктов'
                case 'cart':
                        return 'Корзина'
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
                case 'commission':
                        return 'Комиссия портала'
                default: ''
        }
}