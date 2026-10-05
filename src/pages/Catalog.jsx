import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import VehicleCard from '../components/VehicleCard.jsx'

export function Home() {
  const [featured, setFeatured] = useState([])
  useEffect(() => {
    supabase.from('vehicles').select('*').eq('featured', true).limit(3).then(({ data }) => setFeatured(data || []))
  }, [])
  return (
    <div>
      <section className="hero">
        <h1>Find your next car</h1>
        <p>Verified inventory · Pay securely with Paystack · Receipts via email</p>
        <Link className="btn primary" to="/inventory">Browse inventory</Link>
      </section>
      <h2>Featured</h2>
      <div className="grid">{featured.map((v) => <VehicleCard key={v.id} v={v} />)}</div>
    </div>
  )
}

export function Inventory() {
  const [vehicles, setVehicles] = useState([])
  const [q, setQ] = useState('')
  const [body, setBody] = useState('')
  const [maxM, setMaxM] = useState('') // max millions NGN

  useEffect(() => {
    supabase.from('vehicles').select('*').order('created_at', { ascending: false }).then(({ data }) => setVehicles(data || []))
  }, [])

  const filtered = vehicles.filter((v) => {
    if (q && !`${v.make} ${v.model} ${v.year}`.toLowerCase().includes(q.toLowerCase())) return false
    if (body && v.body_type !== body) return false
    if (maxM && v.price_kobo / 100 / 1e6 > Number(maxM)) return false
    return true
  })

  return (
    <div>
      <h1>Inventory</h1>
      <div className="filters">
        <input placeholder="Search make / model" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={body} onChange={(e) => setBody(e.target.value)}>
          <option value="">All body types</option>
          <option>Sedan</option><option>SUV</option><option>Pickup</option><option>Hatchback</option><option>Coupe</option>
        </select>
        <input type="number" placeholder="Max price (₦m)" value={maxM} onChange={(e) => setMaxM(e.target.value)} />
      </div>
      <div className="grid">{filtered.map((v) => <VehicleCard key={v.id} v={v} />)}</div>
    </div>
  )
}
