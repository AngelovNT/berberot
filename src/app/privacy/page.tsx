import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Clipr' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <nav className="bg-white border-b border-border-warm px-6 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-widest text-charcoal">
          CLIPR<span className="text-brass">.</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-charcoal mb-2">Privacy Policy</h1>
        <p className="text-sm text-warm-gray mb-10">Last updated: June 2025</p>

        <div className="prose prose-sm max-w-none space-y-8 text-charcoal">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Who We Are</h2>
            <p className="text-warm-gray leading-relaxed">
              Clipr ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") is a barbershop booking platform operated from North Macedonia.
              We can be contacted at: <a href="mailto:privacy@berberot.com" className="text-charcoal underline">privacy@berberot.com</a>.
            </p>
            <p className="text-warm-gray leading-relaxed mt-2">
              We are the data controller for personal data collected through this platform.
              This policy applies to all users — customers and barbers — of berberot.com and any associated services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Legal Basis</h2>
            <p className="text-warm-gray leading-relaxed">
              We process your personal data in accordance with the Law on Personal Data Protection of the Republic of North Macedonia
              (Official Gazette No. 42/2020 and subsequent amendments), which implements principles equivalent to those of the EU General
              Data Protection Regulation (GDPR).
            </p>
            <p className="text-warm-gray leading-relaxed mt-2">
              Our legal bases for processing are: (a) <strong>contract performance</strong> — to provide the booking service you signed up for;
              (b) <strong>legitimate interest</strong> — to improve and secure the platform; and (c) <strong>legal obligation</strong> — where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Data We Collect</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border-warm rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-charcoal-50">
                    <th className="text-left px-4 py-3 font-semibold text-charcoal">Data</th>
                    <th className="text-left px-4 py-3 font-semibold text-charcoal">Who</th>
                    <th className="text-left px-4 py-3 font-semibold text-charcoal">Why</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-warm">
                  {[
                    ['Full name', 'All users', 'Account creation and identification'],
                    ['Email address', 'All users', 'Account login, email verification, service notifications'],
                    ['Phone number', 'All users', 'Booking contact, barber communication'],
                    ['Password (hashed)', 'All users', 'Authentication — never stored in plain text'],
                    ['Profile photo', 'Barbers (optional)', 'Displayed to customers during booking'],
                    ['Booking history', 'All users', 'Service delivery, analytics, rebook features'],
                    ['Barbershop name, location, description', 'Barbers', 'Public shop profile and discovery'],
                    ['Working hours, blocked dates', 'Barbers', 'Slot availability calculation'],
                    ['IP address / device info', 'All users', 'Security, fraud prevention (session cookies)'],
                  ].map(([data, who, why]) => (
                    <tr key={data} className="text-warm-gray">
                      <td className="px-4 py-3 font-medium text-charcoal">{data}</td>
                      <td className="px-4 py-3">{who}</td>
                      <td className="px-4 py-3">{why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-warm-gray leading-relaxed mt-3">
              We do <strong>not</strong> collect payment card data. We do <strong>not</strong> sell your data to third parties. We do <strong>not</strong> use your data for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Cookies</h2>
            <p className="text-warm-gray leading-relaxed">
              We use a single, strictly necessary <strong>httpOnly session cookie</strong> to keep you logged in. This cookie:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-warm-gray">
              <li>Is essential for the service to function — no cookie consent is required under applicable law</li>
              <li>Is never accessible to JavaScript (httpOnly) and is encrypted in transit (secure flag in production)</li>
              <li>Expires after 7 days of inactivity</li>
            </ul>
            <p className="text-warm-gray leading-relaxed mt-2">
              We do <strong>not</strong> use tracking cookies, analytics cookies, or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. How We Store and Protect Your Data</h2>
            <p className="text-warm-gray leading-relaxed">
              Your data is stored in MongoDB Atlas (cloud database with data centres in the EU). All passwords are hashed using bcrypt
              before storage — we cannot recover your password. Profile images are stored on Cloudinary (EU region). Data is transmitted
              over HTTPS at all times.
            </p>
            <p className="text-warm-gray leading-relaxed mt-2">
              We retain your account data for as long as your account is active. If you delete your account, your personal data is
              permanently deleted within <strong>30 days</strong>. Booking records may be retained for up to 2 years for legal and
              accounting purposes, in anonymised form where possible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Who We Share Data With</h2>
            <p className="text-warm-gray leading-relaxed">We share data only with essential service providers:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-warm-gray">
              <li><strong>MongoDB Atlas</strong> — database hosting</li>
              <li><strong>Cloudinary</strong> — image hosting</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Vercel</strong> — application hosting</li>
            </ul>
            <p className="text-warm-gray leading-relaxed mt-2">
              All providers are bound by data processing agreements and comply with GDPR-equivalent standards.
              We do not transfer data to countries outside the EU/EEA without appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Your Rights</h2>
            <p className="text-warm-gray leading-relaxed">Under North Macedonia's LPDP you have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-warm-gray">
              <li><strong>Access</strong> — request a copy of your personal data</li>
              <li><strong>Rectification</strong> — correct inaccurate data</li>
              <li><strong>Erasure</strong> — delete your account and personal data (available in Settings)</li>
              <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
              <li><strong>Restriction</strong> — restrict how we process your data</li>
              <li><strong>Object</strong> — object to processing based on legitimate interest</li>
            </ul>
            <p className="text-warm-gray leading-relaxed mt-2">
              To exercise any right, email <a href="mailto:privacy@berberot.com" className="text-charcoal underline">privacy@berberot.com</a>.
              We will respond within <strong>30 days</strong>. You also have the right to lodge a complaint with the
              Directorate for Personal Data Protection of North Macedonia (dzlp.mk).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Children</h2>
            <p className="text-warm-gray leading-relaxed">
              Clipr is not directed at children under 16. We do not knowingly collect data from anyone under 16.
              If you believe a minor has registered, contact us at <a href="mailto:privacy@berberot.com" className="text-charcoal underline">privacy@berberot.com</a> and we will delete the account immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Changes to This Policy</h2>
            <p className="text-warm-gray leading-relaxed">
              We may update this policy when our practices change. Significant changes will be communicated via email.
              The "last updated" date at the top always reflects the current version.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Contact</h2>
            <p className="text-warm-gray leading-relaxed">
              For any privacy-related questions: <a href="mailto:privacy@berberot.com" className="text-charcoal underline">privacy@berberot.com</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border-warm flex gap-6 text-sm text-warm-gray">
          <Link href="/terms" className="hover:text-charcoal transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-charcoal transition-colors">Back to Clipr</Link>
        </div>
      </div>
    </div>
  )
}
