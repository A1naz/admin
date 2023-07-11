interface Rule {
  id: number
  description: string
  category: number
  relies?: number
}
const rules: Rule[] = [{ id: 1, description: 'Добавление 1 артикула конкурентов в корзину во время выкупа', category: 1 },
  { id: 2, description: 'Добавление 2 артикулов конкурентов в корзину во время выкупа', category: 1 },
  { id: 3, description: 'Добавление 3 артикулов конкурентов в корзину во время выкупа', category: 1 },
  { id: 4, description: 'Находиться в карточке товара не менее 60 секунд, изучать карточку', category: 2 },
  { id: 5, description: 'Не выкупать если товар не найден в поисковой выдаче (не выкупать по прямой ссылке)', category: 3 },
  { id: 6, description: 'Выкупать только по будням, не выкупать в выходные дни', category: 4 },
  { id: 7, description: 'Выкупать только в выходные дни, не выкупать по будням', category: 4 },
  { id: 8, description: 'Выкупать только с рекламы, если реклама не найдена - не выкупать', category: 5 },
  { id: 9, description: 'Выкупать с рекламы, если реклама не найдена - выкупать с поиска', category: 5 },
  { id: 10, description: 'Использовать сортировку в поиске - по популярности', category: 6, relies: 8 },
  { id: 11, description: 'Использовать сортировку в поиске - по возрастанию цены', category: 6, relies: 8 },
  { id: 12, description: 'Использовать сортировку в поиске - по убыванию цены', category: 6, relies: 8 },
  { id: 13, description: 'Использовать сортировку в поиске - по новинкам', category: 6, relies: 8 },
  { id: 14, description: 'Использовать сортировку в поиске - сначала выгодные', category: 6, relies: 8 },
  { id: 15, description: 'Использовать сортировку в поиске - по рейтингу', category: 6, relies: 8 },
]
export { rules, Rule }
