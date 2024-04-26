import { Schema, model } from 'mongoose'
import { TariffTypeEnum } from '~/data/enums'
import { ITariff } from '~/data/types'

const TariffPropSchema = new Schema({
  type: {
    type: String,
    enum: TariffTypeEnum,
    required: true,
  },
  value: { type: Number, required: true },
  minPrice: { type: Number, required: false },
})

const TariffSchema = new Schema({
  buyouts: { type: TariffPropSchema },
  HotelsBuyouts: { type: TariffPropSchema },
  deliveryStorage: { type: TariffPropSchema },
  HotelsReview: { type: TariffPropSchema },
  review: { type: TariffPropSchema },
  likeReview: { type: TariffPropSchema },
  likeProduct: { type: TariffPropSchema },
  questionProduct: { type: TariffPropSchema },
  reviewRemoving: { type: TariffPropSchema },
  cart: { type: TariffPropSchema },
  autoAnswer: { type: TariffPropSchema },
  penalty: { type: TariffPropSchema },
})

export const Tariff = model('Tariffs', TariffSchema)
