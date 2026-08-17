import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { ok, err } from '@/lib/apiResponse'
import { COOKIE_NAME } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.nextUrl.searchParams.get('token')
    if (!token) return err('Invalid link', 400)

    const user = await User.findOne({ emailVerificationToken: token })
    if (!user) return err('Invalid or expired link', 400)

    user.emailVerified = true
    user.emailVerificationToken = undefined
    await user.save()

    const jwt = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      barberShopId: user.barberShopId?.toString(),
    })

    const response = ok({ message: 'Email verified successfully.' })

    response.cookies.set(COOKIE_NAME, jwt, {
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
