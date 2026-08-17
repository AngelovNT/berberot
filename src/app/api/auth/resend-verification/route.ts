import { NextRequest } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { ok, err } from '@/lib/apiResponse'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email } = await request.json()
    if (!email) return err('Email is required', 400)

    const user = await User.findOne({ email: email.toLowerCase() })

    // Always return success to avoid email enumeration
    if (!user || user.emailVerified) {
      return ok({ message: 'If that email exists and is unverified, a new link has been sent.' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    user.emailVerificationToken = token
    await user.save()

    await sendVerificationEmail(user.email, user.name, token)

    return ok({ message: 'Verification email sent.' })
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
