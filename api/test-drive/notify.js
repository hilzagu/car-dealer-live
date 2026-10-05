export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' })
  try {
    const { email, name, vehicle, date } = req.body || {}
    if (!email) return res.json({ ok: true, skipped: true })
    const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL } = process.env
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) return res.json({ ok: true, skipped: true })
    const form = new URLSearchParams()
    form.append('from', MAILGUN_FROM_EMAIL || `AutoPrime <mailgun@${MAILGUN_DOMAIN}>`)
    form.append('to', email)
    form.append('subject', `Test drive booked — ${vehicle}`)
    form.append('html', `<h2>Hi ${name || 'there'},</h2><p>Your test drive for <b>${vehicle}</b> on <b>${date}</b> is received.</p>`)
    const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')
    await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form
    })
    return res.json({ ok: true })
  } catch (e) { return res.status(500).json({ ok: false, message: e.message }) }
}
