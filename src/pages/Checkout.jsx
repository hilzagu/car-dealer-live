import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase, formatNGN } from '../lib/supabaseClient.js'
import { checkoutWithPaystack } from '../lib/paystack.js'

export function Cart() {
  const { items, remove, totalKobo } = useCart()
  return (
    <div>
      <h1>Cart</h1>
      {items.length === 0 && <p>Empty. <Link to="/inventory">Browse cars</Link></p>}
      {items.map((i) => (
        <div key={i.id} className="cart-row">
          <span>{i.year} {i.make} {i.model} × {i.qty}</span>
          <span>{formatNGN(i.price_kobo * i.qty)}</span>
          <button onClick={() => remove(i.id)}>Remove</button>
        </div>
      ))}
      {items.length > 0 && <><h3>Total: {formatNGN(totalKobo)}</h3><Link className="btn primary" to="/checkout">Checkout</Link></>}
    </div>
  )
}

export function Checkout() {
  const { items, totalKobo, clear } = useCart()
  const { user, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  const pay = async () => {
    setErr('')
    if (!email) { setErr('Email required'); return }
    if (items.length === 0) { setErr('Cart is empty'); return }
    setBusy(true)
    try {
      const payload = items.map((i) => ({ vehicle_id: i.id, make: i.make, model: i.model, year: i.year, price_kobo: i.price_kobo, qty: i.qty }))
      const { reference } = await checkoutWithPaystack({ supabase, user, items: payload, amountKobo: totalKobo, email })
      clear()
      nav(`/success?ref=${reference}`)
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <div>
      <h1>Checkout (Paystack)</h1>
      {!user && <p><button className="btn" onClick={signInWithGoogle}>Sign in with Google</button> or continue as guest.</p>}
      <div className="form">
        <input placeholder="Email for receipt" value={email} onChange={(e) => setEmail(e.target.value)} />
        <p>Total: <b>{formatNGN(totalKobo)}</b> ({items.length} item(s))</p>
        <button className="btn primary" disabled={busy} onClick={pay}>{busy ? 'Processing…' : 'Pay with Paystack'}</button>
      </div>
      {err && <p className="error">{err}</p>}
    </div>
  )
}

export function Success() {
  const ref = new URLSearchParams(window.location.search).get('ref')
  return <div><h1>Payment successful 🎉</h1><p>Reference: <code>{ref}</code></p><p>Receipt sent via email (Mailgun). View it in <Link to="/dashboard">Orders</Link>.</p></div>
}
