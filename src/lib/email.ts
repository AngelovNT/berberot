import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? 'Clipr <noreply@berberot.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const link = `${APP_URL}/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your Berberot account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#F8F6F2">
        <h1 style="font-size:24px;font-weight:800;letter-spacing:0.15em;color:#161616;margin:0 0 4px">BERBEROT<span style="color:#C49A3C">.</span></h1>
        <p style="color:#6B6B6B;font-size:13px;margin:0 0 32px;text-transform:uppercase;letter-spacing:0.08em">Book your next cut</p>

        <h2 style="font-size:20px;font-weight:700;color:#161616;margin:0 0 12px">Hi ${name},</h2>
        <p style="font-size:15px;color:#444;line-height:1.6;margin:0 0 28px">
          Thanks for signing up. Click the button below to verify your email address and activate your account.
        </p>

        <a href="${link}" style="display:inline-block;background:#161616;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;letter-spacing:0.02em">
          Verify my email
        </a>

        <p style="font-size:13px;color:#6B6B6B;margin:28px 0 0;line-height:1.6">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>

        <hr style="border:none;border-top:1px solid #E8E4DE;margin:32px 0" />
        <p style="font-size:12px;color:#999;margin:0">
          Or copy this link: <a href="${link}" style="color:#C49A3C">${link}</a>
        </p>
      </div>
    `,
  })
}
