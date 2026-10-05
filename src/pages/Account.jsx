import { useEffect, useState } from 'react'
import { supabase, formatNGN } from '../lib/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'

export function Dashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  useEffect(() => {
    if (!user) return
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data || []))
  }, [user])
  if (!user) return <p>Sign in with Google to view orders.</p>
  return (
    <div>
      <h1>My orders</h1>
      {orders.map((o) => (
        <div key={o.id} className="order">
          <b>{o.paystack_ref}</b> · {o.status} · {formatNGN(o.amount_kobo)}
          <pre>{JSON.stringify(o.items, null, 2)}</pre>
        </div>
      ))}
      {orders.length === 0 && <p>No orders yet.</p>}
    </div>
  )
}

export function Admin() {
  const [form, setForm] = useState({ make: '', model: '', year: 2023, price_m: '', mileage_km: 0, fuel: 'Petrol', transmission: 'Automatic', body_type: 'Sedan', color: '', image_url: '', stock: 1, description: '' })
  const [msg, setMsg] = useState('')
  const save = async (e) => {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase.from('vehicles').insert({
      ...form,
      year: Number(form.year),
      mileage_km: Number(form.mileage_km),
      stock: Number(form.stock),
      price_kobo: Math.round(Number(form.price_m) * 1e6 * 100)
    })
    setMsg(error ? error.message : 'Vehicle added!')
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  return (
    <div>
      <h1>Add vehicle (admin)</h1>
      <p className="muted">Lock this route behind an admin check in production.</p>
      <form onSubmit={save} className="form">
        <input required placeholder="Make" value={form.make} onChange={set('make')} />
        <input required placeholder="Model" value={form.model} onChange={set('model')} />
        <input type="number" placeholder="Year" value={form.year} onChange={set('year')} />
        <input required type="number" placeholder="Price (₦ millions)" value={form.price_m} onChange={set('price_m')} />
        <input placeholder="Image URL" value={form.image_url} onChange={set('image_url')} />
        <input placeholder="Color" value={form.color} onChange={set('color')} />
        <textarea placeholder="Description" value={form.description} onChange={set('description')} />
        <button className="btn primary" type="submit">Save</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
