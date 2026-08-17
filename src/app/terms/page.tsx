import Link from 'next/link'

export const metadata = { title: 'Terms of Service — Clipr' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <nav className="bg-white border-b border-border-warm px-6 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-widest text-charcoal">
          CLIPR<span className="text-brass">.</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-charcoal mb-2">Terms of Service</h1>
        <p className="text-sm text-warm-gray mb-10">Last updated: June 2025</p>

        <div className="space-y-8 text-charcoal">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Acceptance</h2>
            <p className="text-warm-gray leading-relaxed">
              By creating an account or using Clipr ("<strong>the Service</strong>"), you agree to these Terms of Service.
              If you do not agree, do not use the Service. These terms are governed by the laws of the Republic of North Macedonia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. What Clipr Is</h2>
            <p className="text-warm-gray leading-relaxed">
              Clipr is a booking platform that connects customers with barbershops. We facilitate the booking — we are
              <strong> not</strong> a barbershop, employer of barbers, or party to the service agreement between a customer and a barber.
              Barbers and barbershops are independent businesses using our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Accounts</h2>
            <ul className="list-disc pl-5 space-y-2 text-warm-gray">
              <li>You must be at least 16 years old to create an account.</li>
              <li>You must provide accurate information including a valid email address, which must be verified before you can log in.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You may not share your account with others or create accounts for others without their knowledge.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Bookings — Customers</h2>
            <ul className="list-disc pl-5 space-y-2 text-warm-gray">
              <li>Bookings made through Clipr are agreements between you and the barbershop, not with Clipr.</li>
              <li>Please arrive on time. Repeated no-shows may result in account restrictions.</li>
              <li>Cancellation policies are set by individual barbershops. Respect them.</li>
              <li>Clipr is not responsible for the quality of services provided by barbershops.</li>
              <li>If you have a dispute with a barbershop, contact the shop directly in the first instance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Bookings — Barbers</h2>
            <ul className="list-disc pl-5 space-y-2 text-warm-gray">
              <li>By listing your barbershop on Clipr, you agree to honour confirmed bookings.</li>
              <li>Your shop information (name, location, description, photos, services, prices) must be accurate and kept up to date.</li>
              <li>You are responsible for setting correct working hours and blocking dates when unavailable.</li>
              <li>You must comply with all applicable North Macedonian laws, including business registration requirements and consumer protection laws.</li>
              <li>We may suspend or remove your listing if customer complaints indicate repeated no-shows, inaccurate information, or unprofessional conduct.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. User-Generated Content</h2>
            <p className="text-warm-gray leading-relaxed">
              You may upload photos (profile photos, shop cover images). By uploading content you confirm:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-warm-gray">
              <li>You own the content or have permission to use it.</li>
              <li>The content does not infringe any third-party intellectual property rights.</li>
              <li>The content does not depict anything illegal, offensive, or misleading.</li>
            </ul>
            <p className="text-warm-gray leading-relaxed mt-2">
              You grant Clipr a non-exclusive, royalty-free licence to store and display your content solely for operating the Service.
              We may remove content that violates these terms without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Prohibited Use</h2>
            <p className="text-warm-gray leading-relaxed">You may not use Clipr to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-warm-gray">
              <li>Create fake bookings or spam barbershops</li>
              <li>Scrape, copy, or resell any part of the platform</li>
              <li>Attempt to access other users' accounts or data</li>
              <li>Upload malicious code or attempt to disrupt the Service</li>
              <li>Impersonate another person or business</li>
              <li>Use the platform for any unlawful purpose under North Macedonian law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Availability and Changes</h2>
            <p className="text-warm-gray leading-relaxed">
              We aim for high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any
              part of the Service at any time. We will provide reasonable notice for significant changes that affect your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Limitation of Liability</h2>
            <p className="text-warm-gray leading-relaxed">
              To the maximum extent permitted by North Macedonian law, Clipr is not liable for:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-warm-gray">
              <li>The quality or outcome of barbershop services booked through the platform</li>
              <li>Disputes between customers and barbershops</li>
              <li>Loss of data beyond our reasonable control</li>
              <li>Indirect or consequential losses arising from your use of the Service</li>
            </ul>
            <p className="text-warm-gray leading-relaxed mt-2">
              Nothing in these terms limits liability for death, personal injury, or fraud caused by our negligence.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Termination and Account Deletion</h2>
            <p className="text-warm-gray leading-relaxed">
              You may delete your account at any time from your Settings page. Upon deletion, your personal data will be
              permanently removed within 30 days in accordance with our <Link href="/privacy" className="text-charcoal underline">Privacy Policy</Link>.
            </p>
            <p className="text-warm-gray leading-relaxed mt-2">
              We may terminate your account immediately if you violate these terms, with or without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. Governing Law</h2>
            <p className="text-warm-gray leading-relaxed">
              These terms are governed by the laws of the Republic of North Macedonia. Any dispute shall be subject to the
              exclusive jurisdiction of the courts of North Macedonia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">12. Contact</h2>
            <p className="text-warm-gray leading-relaxed">
              Questions about these terms: <a href="mailto:legal@berberot.com" className="text-charcoal underline">legal@berberot.com</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border-warm flex gap-6 text-sm text-warm-gray">
          <Link href="/privacy" className="hover:text-charcoal transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-charcoal transition-colors">Back to Clipr</Link>
        </div>
      </div>
    </div>
  )
}
