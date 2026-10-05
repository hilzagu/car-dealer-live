async function sendMail({ to, subject, html }) {
  const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL } = process.env
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) return { skipped: true }
  const form = new URLSearchParams()
  form.append('from', MAILGUN_FROM_EMAIL || `AutoPrime <mailgun@${MAILGUN_DOMAIN}>`)
  form.append('to', to)
  form.append('subject', subject)
  form.append('html', html)
  const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')
  const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form
  })
  if (!res.ok) throw new Error('Mailgun error: ' + (await res.text()).slice(0, 300))
  return res.json()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' })
  try {
    const { reference } = req.query
    const { email, amount } = req.body || {}
    const to = email || 'customer@example.com'
    await sendMail({
      to,
      subject: `AutoPrime receipt — ${reference}`,
      html: `<h2>Payment received</h2><p>Reference: <b>${reference}</b></p><p>Amount: ${amount || ''}</p><p>Our sales team will contact you for delivery/paperwork.</p>`
    })
    return res.json({ ok: true })
  } catch (e) { return res.status(500).json({ ok: false, message: e.message }) }
}
