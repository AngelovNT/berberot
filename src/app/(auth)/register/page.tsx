import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-widest text-charcoal">
            BERBEROT<span className="text-brass">.</span>
          </Link>
          <h1 className="text-xl font-semibold text-charcoal mt-5">Create your account</h1>
          <p className="text-warm-gray text-sm mt-1">Join Berberot today — it&apos;s free</p>
        </div>

        <div className="bg-white rounded-2xl border border-border-warm shadow-card p-6">
          <RegisterForm />
        </div>

        <p className="text-center text-sm text-warm-gray mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brass font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
