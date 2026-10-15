import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

/* One favourites store for the whole site, so a heart saved on a card is also saved on the event page. */
type Favorites = { has: (id: string) => boolean; toggle: (id: string) => void }

const FavoritesContext = createContext<Favorites | null>(null)

export default function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<ReadonlySet<string>>(() => new Set())
  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])
  const value = useMemo(() => ({ has: (id: string) => ids.has(id), toggle }), [ids, toggle])
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorite(id: string): [boolean, () => void] {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error("useFavorite must be used inside FavoritesProvider")
  return [ctx.has(id), () => ctx.toggle(id)]
}
