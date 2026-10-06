import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect x="4" y="14" width="40" height="28" rx="4" fill="#7C3AED" />
    <rect x="10" y="20" width="12" height="10" rx="2" fill="#C4B5FD" />
    <rect x="26" y="20" width="12" height="10" rx="2" fill="#C4B5FD" />
    <rect x="50" y="24" width="10" height="18" rx="4" fill="#5B21B6" />
    <circle cx="18" cy="46" r="6" fill="#1F2937" />
    <circle cx="18" cy="46" r="3" fill="#F9FAFB" />
    <circle cx="46" cy="46" r="6" fill="#1F2937" />
    <circle cx="46" cy="46" r="3" fill="#F9FAFB" />
  </svg>
)

export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth()
  const { count } = useCart()
  return (
    <header className="nav">
      <Link to="/" className="brand">
        <Logo />
        <span>AutoPrime</span>
      </Link>
      <nav className="main-nav">
        <Link to="/">Home</Link>
        <Link to="/inventory">Inventory</Link>
        <Link to="/cart">Cart{count ? ` (${count})` : ''}</Link>
        <Link to="/dashboard">Orders</Link>
      </nav>
      <div className="nav-actions">
        {user ? (
          <>
            <span className="user-pill">{user.email}</span>
            <button className="btn ghost" onClick={signOut}>Logout</button>
          </>
        ) : (
          <button className="btn primary" onClick={signInWithGoogle}>Sign in</button>
        )}
      </div>
    </header>
  )
}
