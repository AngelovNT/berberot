import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

async function getPayload(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  const isProtectedDashboard = pathname.startsWith('/dashboard')
  const isProtectedAdmin = pathname.startsWith('/admin')
  const isProtectedMyBookings = pathname === '/my-bookings'
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isProtectedDashboard || isProtectedAdmin || isProtectedMyBookings) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = await getPayload(token)
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const role = payload.role as string

    if (isProtectedAdmin && role !== 'admin') {
      if (role === 'barber') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/my-bookings', request.url))
    }

    if (isProtectedDashboard && role !== 'barber' && role !== 'admin') {
      return NextResponse.redirect(new URL('/my-bookings', request.url))
    }

    if (isProtectedMyBookings && role !== 'customer') {
      if (role === 'barber') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }
  }

  if (isAuthPage && token) {
    const payload = await getPayload(token)
    if (payload) {
      const role = payload.role as string
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else if (role === 'barber') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/my-bookings', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
