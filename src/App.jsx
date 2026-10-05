import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import Navbar from './components/Navbar.jsx'
import { Home, Inventory } from './pages/Catalog.jsx'
import VehicleDetail from './pages/VehicleDetail.jsx'
import { Cart, Checkout, Success } from './pages/Checkout.jsx'
import { Dashboard, Admin } from './pages/Account.jsx'
import { envMissing } from './lib/supabaseClient.js'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          {envMissing && (
            <p style={{ background: '#fff3cd', padding: 12, margin: 0, textAlign: 'center' }}>
              Supabase keys missing on this deployment — set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in Vercel env vars and redeploy.
            </p>
          )}
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/vehicle/:id" element={<VehicleDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<Success />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
