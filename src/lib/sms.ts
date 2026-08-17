import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_FROM_NUMBER // e.g. '+15551234567' or 'whatsapp:+14155238886'

export async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[SMS] Twilio credentials not configured — skipping')
    return false
  }
  try {
    const client = twilio(accountSid, authToken)
    await client.messages.create({ from: fromNumber, to, body })
    return true
  } catch (e) {
    console.error('[SMS] Failed to send:', e)
    return false
  }
}

export function buildReminderMessage({
  customerName,
  serviceName,
  startTime,
  date,
  barberName,
  shopName,
}: {
  customerName: string
  serviceName: string
  startTime: string
  date: string
  barberName: string
  shopName: string
}): string {
  const d = new Date(date + 'T00:00:00').toLocaleDateString('en-IE', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
  return `Hi ${customerName}! Reminder: your ${serviceName} with ${barberName} at ${shopName} is today at ${startTime} (${d}). See you soon! — Berberot`
}
