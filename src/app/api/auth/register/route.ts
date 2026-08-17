import { NextRequest } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import BarberShop from '@/models/BarberShop'
import { ok, err } from '@/lib/apiResponse'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, email, password, role, phone, shopId } = body

    if (!name || !email || !password || !role) {
      return err('All fields are required', 400)
    }

    if (!['barber', 'customer'].includes(role)) {
      return err('Invalid role', 400)
    }

    if (password.length < 6) {
      return err('Password must be at least 6 characters', 400)
    }

    let resolvedShopId: string | undefined
    if (shopId && role === 'barber') {
      const shop = await BarberShop.findById(shopId)
      if (!shop || !shop.isActive) return err('Shop not found or inactive', 404)
      resolvedShopId = shop._id.toString()
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return err('Email already registered', 409)
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')

    await User.create({
      name, email, password, role, phone: phone ?? '',
      emailVerified: false,
      emailVerificationToken: verificationToken,
      ...(resolvedShopId ? { barberShopId: resolvedShopId } : {}),
    })

    try {
      await sendVerificationEmail(email, name, verificationToken)
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr)
      // Don't block registration if email fails — user can request resend
    }

    return ok({ message: 'Account created. Please check your email to verify your account.' }, 201)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
