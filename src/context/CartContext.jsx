import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './AuthContext.jsx'

const CartCtx = createContext(null)

export const useCart = () => useContext(CartCtx)

export function CartProvider({ children }) {
  const { user } = useAuth()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const loadCart = async () => {
    if (!user) {
      setItems([])
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        vehicle:vehicles (
          id,
          make,
          model,
          year,
          price_kobo,
          image_url
        )
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error loading cart:', error)
      setLoading(false)
      return
    }

    const formattedItems = (data || [])
      .filter((item) => item.vehicle)
      .map((item) => ({
        id: item.vehicle.id,
        make: item.vehicle.make,
        model: item.vehicle.model,
        year: item.vehicle.year,
        price_kobo: item.vehicle.price_kobo,
        image_url: item.vehicle.image_url,
        qty: item.quantity,
      }))

    setItems(formattedItems)
    setLoading(false)
  }

  // Load the user's cart whenever they sign in/out.
  useEffect(() => {
    loadCart()
  }, [user?.id])

  // Listen for cart changes from another device/browser.
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`cart-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadCart()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const add = async (vehicle) => {
    if (!user) {
      alert('Please sign in before adding a vehicle to your cart.')
      return
    }

    const existing = items.find((item) => item.id === vehicle.id)

    const { error } = await supabase
      .from('cart_items')
      .upsert(
        {
          user_id: user.id,
          vehicle_id: vehicle.id,
          quantity: existing ? existing.qty + 1 : 1,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,vehicle_id',
        }
      )

    if (error) {
      console.error('Error adding vehicle to cart:', error)
      alert('Could not add this vehicle to your cart.')
      return
    }

    await loadCart()
  }

  const remove = async (vehicleId) => {
    if (!user) return

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('vehicle_id', vehicleId)

    if (error) {
      console.error('Error removing vehicle:', error)
      return
    }

    await loadCart()
  }

  const clear = async () => {
    if (!user) return

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing cart:', error)
      return
    }

    setItems([])
  }

  const totalKobo = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price_kobo) * item.qty,
        0
      ),
    [items]
  )

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  )

  return (
    <CartCtx.Provider
      value={{
        items,
        add,
        remove,
        clear,
        totalKobo,
        count,
        loading,
      }}
    >
      {children}
    </CartCtx.Provider>
  )
}