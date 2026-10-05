import { createContext, useContext, useMemo, useState } from 'react'

const CartCtx = createContext(null)
export const useCart = () => useContext(CartCtx)

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // [{id, make, model, year, price_kobo, image_url, qty}]

  const add = (v) => setItems((prev) => {
    const f = prev.find((i) => i.id === v.id)
    if (f) return prev.map((i) => (i.id === v.id ? { ...i, qty: i.qty + 1 } : i))
    return [...prev, { id: v.id, make: v.make, model: v.model, year: v.year, price_kobo: v.price_kobo, image_url: v.image_url, qty: 1 }]
  })
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clear = () => setItems([])

  const totalKobo = useMemo(() => items.reduce((s, i) => s + i.price_kobo * i.qty, 0), [items])

  return <CartCtx.Provider value={{ items, add, remove, clear, totalKobo, count: items.length }}>{children}</CartCtx.Provider>
}
