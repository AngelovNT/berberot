import { ok } from '@/lib/apiResponse'
import { COOKIE_NAME } from '@/lib/constants'

export async function POST() {
  const response = ok({ message: 'Logged out' })
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return response
}
