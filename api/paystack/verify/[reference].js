async function sendMail({ to, subject, html }) {
  const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL } = process.env
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    console.log('[mailgun:skipped] to=%s subject=%s', to, subject)
    return { skipped: true }
  }
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
  if (req.method !== 'GET') return res.status(405).json({ status: 'error', message: 'Method not allowed' })
  const { reference } = req.query
  try {
    const r = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    })
    const data = await r.json()
    if (!data.status) return res.status(400).json({ status: 'error', message: 'Paystack verify failed' })
    return res.json({ status: 'success', data: data.data })
  } catch (e) { return res.status(500).json({ status: 'error', message: e.message }) }
}

export { sendMail }
