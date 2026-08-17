export const ROLES = {
  ADMIN: 'admin',
  BARBER: 'barber',
  CUSTOMER: 'customer',
} as const

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export const COOKIE_NAME = 'token'
