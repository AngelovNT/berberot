import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-widest text-charcoal">
            BERBEROT<span className="text-brass">.</span>
          </Link>
          <h1 className="text-xl font-semibold text-charcoal mt-5">Welcome back</h1>
          <p className="text-warm-gray text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-border-warm shadow-card p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-warm-gray mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brass font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
