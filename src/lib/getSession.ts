import { cookies } from 'next/headers'
import { verifyToken } from './auth'
import { ISession } from '@/types'

export async function getSession(): Promise<ISession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null

    const payload = await verifyToken(token)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as ISession['role'],
      barberShopId: payload.barberShopId as string | undefined,
    }
  } catch {
    return null
  }
}

export async function getSessionFromRequest(request: Request): Promise<ISession | null> {
  try {
    const cookieHeader = request.headers.get('cookie') ?? ''
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)
    const token = match?.[1]
    if (!token) return null

    const payload = await verifyToken(token)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as ISession['role'],
      barberShopId: payload.barberShopId as string | undefined,
    }
  } catch {
    return null
  }
}
