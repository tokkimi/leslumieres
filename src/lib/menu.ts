import raw from '@/data/menu.json'

export type Option = { n: string; p: number; show?: string[] }
export type Group = { t: string; h: string; k: 'single' | 'multi' | 'remove'; o: Option[]; req?: number; hid?: number; c?: string; max?: number }
export type Product = { id: string; n: string; p: number; d?: string; o?: string[] }
export type Section = { id: string; t: string; items: Product[] }
export type Category = { id: string; name: string; tag: string; img: string; sections: Section[] }
export type ProductRef = Product & { cat: Category; sec: Section }

export const DATA = raw as unknown as { cats: Category[]; groups: Record<string, Group> }
export const CATS = DATA.cats
export const GROUPS = DATA.groups
export const PRODUCTS: Record<string, ProductRef> = {}
CATS.forEach(c => c.sections.forEach(s => s.items.forEach(p => { PRODUCTS[p.id] = { ...p, cat: c, sec: s } })))
export const catById = (id: string) => CATS.find(c => c.id === id)!
export const countCat = (c: Category) => c.sections.reduce((n, s) => n + s.items.length, 0)

declare const __ASSET_V__: string
export const img = (id: string) => `/assets/img/plats/${id}.webp?v=${__ASSET_V__}`
export const catImg = (id: string) => `/assets/img/categories/${id}.webp`
export const LOGO = '/assets/img/logo/les-lumieres-clair.svg'
export const LOGO_FONCE = '/assets/img/logo/les-lumieres-fonce.svg'
export const eur = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
export const lower = (s: string) => s.toLowerCase()

export type Mode = 'emporter' | 'surplace'
export const MODE_LABEL: Record<Mode, string> = { emporter: 'À emporter', surplace: 'Sur place' }

export type Chosen = { g: string; n: string; p: number; rm: boolean }
export type Line = { key: string; id: string; n: string; sec: string; opts: Chosen[]; note: string; unit: number; qty: number }

export const store = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem('ll_' + k); return v ? (JSON.parse(v) as T) : d } catch { return d } },
  set(k: string, v: unknown) { try { localStorage.setItem('ll_' + k, JSON.stringify(v)) } catch { /* stockage indisponible */ } },
}
