import { TariffTypeEnum, FieldsType, UserRoles } from './enums'
import { ObjectId } from 'mongodb'

export interface Entity {
  _id?: any
  id?: any
}

export interface IUser extends Entity {
  isBanned: boolean
  username: string | undefined
  firstName: string
  lastName: string
  email: string
  wbApiKey: string
  wbApiKeys: []
  password: string
  uuid: string
  uuidCompany: string
  acesses: string[]
  roles: UserRoles[]
  tabs: string
  newEmail: string
  emailConfirmed: string
  telegram: string | undefined
  telegramUserId: string
  telegramUnlinkEmailSend: Date
  tg2fa: boolean
  balance: number
  registrationDate: Date
  partner: Partner
  tariff: ITariff
  currentCabinet: ObjectId
  cabinets: any[]
  allowedUsersModal: Boolean
}

export interface IUserLogs extends Entity {
  userId: ObjectId,
  userNick: string,
  userEmail: string,
  uuidCompany: string,
  description: string,
  documentType: string,
  documentId: string,
  mp: string,
  createdAt?: Date
}

export interface Partner {
  balance: number
  refCount: number
  rewardPercent: number
}

export interface OptionsMulti {
  value: string
  name: string
}

export interface ConfigTable {
  field: string
  header: string
  type: FieldsType
  actions?: any
}

export interface ConfigModal {
  field: string
  header: string
  type: FieldsType
  options?: any[]
}

export interface IPlan {
  name: string
  createdAt: Date
  tariff: ITariff
}

export interface ITariff {
  buyouts: TariffProp
  deliveryStorage: TariffProp
  review: TariffProp
  likeReview: TariffProp
  likeProduct: TariffProp
  questionProduct: TariffProp
  cart: TariffProp
  autoAnswer: TariffProp
}

export interface TariffProp {
  type: TariffTypeEnum
  value: number
}

export interface ITabs {
  title: string
  slot: string
  query: string
}
