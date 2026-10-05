import { Link } from 'react-router-dom'
import { formatNGN } from '../lib/supabaseClient.js'
import { useCart } from '../context/CartContext.jsx'

export default function VehicleCard({ v }) {
  const { add } = useCart()
  return (
    <div className="card">
      <Link to={`/vehicle/${v.id}`}>
        <img src={v.image_url} alt={`${v.make} ${v.model}`} loading="lazy" />
      </Link>
      <div className="card-body">
        <h3>{v.year} {v.make} {v.model}</h3>
        <p className="muted">{v.body_type} · {v.transmission} · {v.fuel} · {Number(v.mileage_km).toLocaleString()} km</p>
        <p className="price">{formatNGN(v.price_kobo)}</p>
        <div className="row">
          <Link className="btn" to={`/vehicle/${v.id}`}>View</Link>
          <button className="btn primary" onClick={() => add(v)}>Add to cart</button>
        </div>
      </div>
    </div>
  )
}
