import type { Rule } from '@/data/buyout/rules'

export interface SearchQuery {
  value: string
  error: boolean
  loading: boolean
  message: string | undefined
}
export interface Item {
  image: string
  name: string
  article: number
  price: number
  priceText: string
  quantity: number
  sizes: number[] | string[]
  sex: string
  searchQuery: SearchQuery[]
  adress: string
  dateRange: [Date | null, Date | null]
  selectedSize: number | string
  rules: Rule[]
}
