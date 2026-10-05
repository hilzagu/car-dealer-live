import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, formatNGN } from '../lib/supabaseClient.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function VehicleDetail() {
  const { id } = useParams()
  const [v, setV] = useState(null)
  const { add } = useCart()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', date: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('vehicles').select('*').eq('id', id).single().then(({ data }) => setV(data))
  }, [id])

  const bookTestDrive = async (e) => {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase.from('test_drives').insert({
      vehicle_id: id,
      user_id: user?.id ?? null,
      name: form.name,
      email: user?.email ?? '',
      phone: form.phone,
      preferred_date: form.date
    })
    if (error) { setMsg(error.message); return }
    // Notify backend -> Mailgun confirmation
    const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4242'
    await fetch(`${API}/api/test-drive/notify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user?.email, name: form.name, vehicle: `${v.year} ${v.make} ${v.model}`, date: form.date })
    }).catch(() => {})
    setMsg('Test drive requested! Confirmation email on its way.')
  }

  if (!v) return <p>Loading…</p>
  return (
    <div className="detail">
      <img src={v.image_url} alt={`${v.make} ${v.model}`} />
      <div>
        <h1>{v.year} {v.make} {v.model}</h1>
        <p className="price">{formatNGN(v.price_kobo)}</p>
        <p>{v.description}</p>
        <p className="muted">{v.body_type} · {v.transmission} · {v.fuel} · {v.color} · {Number(v.mileage_km).toLocaleString()} km · Stock: {v.stock}</p>
        <button className="btn primary" onClick={() => add(v)}>Add to cart</button>
        <hr />
        <h3>Book a test drive</h3>
        <form onSubmit={bookTestDrive} className="form">
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <button className="btn" type="submit">Request test drive</button>
        </form>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  )
}
