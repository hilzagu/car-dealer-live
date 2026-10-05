import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth()
  const { count } = useCart()
  return (
    <header className="nav">
      <Link to="/" className="brand">🚗 AutoPrime</Link>
      <nav>
        <Link to="/inventory">Inventory</Link>
        <Link to="/cart">Cart ({count})</Link>
        <Link to="/dashboard">Orders</Link>
      </nav>
      <div>
        {user ? (
          <><span className="user">{user.email}</span><button onClick={signOut}>Logout</button></>
        ) : (
          <button onClick={signInWithGoogle}>Sign in with Google</button>
        )}
      </div>
    </header>
  )
}
