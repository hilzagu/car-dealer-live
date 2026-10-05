// Minimal backend: Paystack verification + Mailgun emails.
// Run: npm run server (needs server/.env or root .env)
// Endpoints:
//   GET  /api/paystack/verify/:reference
//   POST /api/orders/:reference/receipt
//   POST /api/test-drive/notify

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const { PAYSTACK_SECRET_KEY, MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL, FRONTEND_URL } = process.env

async function sendMail({ to, subject, html }) {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    console.log('[mailgun:skipped] no keys. to=%s subject=%s', to, subject)
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

app.get('/api/paystack/verify/:reference', async (req, res) => {
  try {
    const r = await fetch(`https://api.paystack.co/transaction/verify/${req.params.reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
    })
    const data = await r.json()
    if (!data.status) return res.status(400).json({ status: 'error', message: 'Paystack verify failed' })
    res.json({ status: 'success', data: data.data })
  } catch (e) { res.status(500).json({ status: 'error', message: e.message }) }
})

app.post('/api/orders/:reference/receipt', async (req, res) => {
  try {
    // In production: fetch order from Supabase service-role by reference for amount/items/email.
    const { reference } = req.params
    const { email, amount } = req.body
    const to = email || 'customer@example.com'
    await sendMail({
      to,
      subject: `AutoPrime receipt — ${reference}`,
      html: `<h2>Payment received 🎉</h2><p>Reference: <b>${reference}</b></p><p>Amount: ${amount || ''}</p><p>Our sales team will contact you for delivery/paperwork.</p>`
    })
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ ok: false, message: e.message }) }
})

app.post('/api/test-drive/notify', async (req, res) => {
  try {
    const { email, name, vehicle, date } = req.body
    if (!email) return res.json({ ok: true, skipped: true })
    await sendMail({
      to: email,
      subject: `Test drive booked — ${vehicle}`,
      html: `<h2>Hi ${name || 'there'},</h2><p>Your test drive for <b>${vehicle}</b> on <b>${date}</b> is received. We will confirm shortly.</p>`
    })
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ ok: false, message: e.message }) }
})

const port = 4242
app.listen(port, () => console.log(`API on http://localhost:${port} (frontend: ${FRONTEND_URL || 'http://localhost:5173'})`))
