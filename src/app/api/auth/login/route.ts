import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { ok, err } from '@/lib/apiResponse'
import { COOKIE_NAME } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return err('Email and password are required', 400)
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return err('Invalid credentials', 401)
    }

    if (!user.isActive) {
      return err('Account is deactivated', 403)
    }

    if (!user.emailVerified) {
      return err('Please verify your email before logging in. Check your inbox.', 403)
    }

    const valid = await user.comparePassword(password)
    if (!valid) {
      return err('Invalid credentials', 401)
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      barberShopId: user.barberShopId?.toString(),
    })

    const response = ok({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      barberShopId: user.barberShopId,
      isActive: user.isActive,
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
