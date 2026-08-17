export interface IUser {
  _id: string
  name: string
  email: string
  password?: string
  role: 'admin' | 'barber' | 'customer'
  barberShopId?: string
  isActive: boolean
  photo?: string
  phone?: string
  createdAt?: string
  updatedAt?: string
}

export interface IBarberShop {
  _id: string
  name: string
  location: string
  ownerId: string
  isActive: boolean
  coverImage?: string
  description?: string
  instagram?: string
  facebook?: string
  website?: string
  promoVideo?: string
  createdAt?: string
  updatedAt?: string
}

export interface IService {
  _id: string
  barberShopId: string
  name: string
  price: number
  duration: number
  createdAt?: string
  updatedAt?: string
}

export interface IBooking {
  _id: string
  barberId: string | IUser
  userId: string | IUser
  serviceId: string | IService
  date: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  phone?: string
  rating?: number
  reviewText?: string
  recurrenceWeeks?: number
  barberShopId?: string
  createdAt?: string
  updatedAt?: string
}

export interface ITimeWindow {
  start: string
  end: string
}

export type DaySchedule = ITimeWindow[]

export interface WeekSchedule {
  monday?: DaySchedule
  tuesday?: DaySchedule
  wednesday?: DaySchedule
  thursday?: DaySchedule
  friday?: DaySchedule
  saturday?: DaySchedule
  sunday?: DaySchedule
}

export interface IWorkingHours {
  _id: string
  barberId: string
  schedule: WeekSchedule
  bufferMinutes: number
}

export interface ISession {
  userId: string
  email: string
  name: string
  role: 'admin' | 'barber' | 'customer'
  barberShopId?: string
}

export interface ITimeSlot {
  startTime: string
  endTime: string
}
