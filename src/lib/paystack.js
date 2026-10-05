import Paystack from '@paystack/inline-js'

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4242'
const PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

// Create order row (pending) then open Paystack popup. Verify on success.
export async function checkoutWithPaystack({ supabase, user, items, amountKobo, email }) {
  if (!PUBLIC_KEY) throw new Error('Missing VITE_PAYSTACK_PUBLIC_KEY')
  const ref = 'AP_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)

  const { error } = await supabase.from('orders').insert({
    user_id: user?.id ?? null,
    email,
    items,
    amount_kobo: amountKobo,
    paystack_ref: ref,
    status: 'pending'
  })
  if (error) throw error

  return new Promise((resolve, reject) => {
    const popup = new Paystack()
    popup.newTransaction({
      key: PUBLIC_KEY,
      email,
      amount: amountKobo, // Paystack expects kobo
      reference: ref,
      metadata: { items: items.length },
      onSuccess: async (trx) => {
        try {
          const res = await fetch(`${API}/api/paystack/verify/${trx.reference}`, { method: 'GET' })
          const data = await res.json()
          if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Verification failed')
          await supabase.from('orders').update({ status: 'paid' }).eq('paystack_ref', trx.reference)
          // Fire receipt email via backend (Mailgun)
          fetch(`${API}/api/orders/${trx.reference}/receipt`, { method: 'POST' }).catch(() => {})
          resolve({ reference: trx.reference, receipt: data })
        } catch (e) { reject(e) }
      },
      onCancel: () => reject(new Error('Payment cancelled'))
    })
  })
}
