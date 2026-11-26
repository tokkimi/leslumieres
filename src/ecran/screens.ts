/* Contenu des écrans TV du comptoir (3 écrans 16:9 côte à côte, comme en salle). */

export type Fx = 'ice' | 'steam' | 'sugar'
export type Spot = { id: string; name: string; phrase: string }
export type Row = { id: string; name: string }
export type Section =
  | { kind: 'list'; title: string; rows: Row[] }
  | { kind: 'flavors'; title: string; price: number; rows: Row[] }
export type Showcase = { eyebrow: string; title: string; script: string; line: string; price: string; priceLabel: string; items: Row[] }
export type Screen = {
  n: number
  eyebrow: string
  title: string
  script: string
  headline: string
  fx: Fx
  spots: [Spot, Spot]
  feature: Spot
  sections: Section[]
  showcase: Showcase
  introOffset: number
}

export const SCREENS: Screen[] = [
  {
    n: 1,
    eyebrow: 'Boissons fraîches',
    title: 'Thés glacés & cocktails',
    script: 'faits minute',
    headline: 'Fraîcheur maison',
    fx: 'ice',
    introOffset: 0,
    showcase: {
      eyebrow: 'Fait maison', title: 'Thés glacés', script: 'cinq saveurs, servis bien frais', line: 'Infusés chaque jour, servis sur glace', price: '3,90 €', priceLabel: 'le verre',
      items: [
        { id: '159951', name: 'Ananas coco' }, { id: '159952', name: 'Fraise framboise' }, { id: '159949', name: 'Mangue passion' },
        { id: '159953', name: 'Marrakech' }, { id: '159950', name: 'Pêche litchi' },
      ],
    },
    spots: [
      { id: '159956', name: 'Virgin mojito fraise', phrase: 'Menthe fraîche, citron vert et fraises écrasées.' },
      { id: '159949', name: 'Thé glacé mangue passion', phrase: 'Mangue juteuse et passion, servi bien frais.' },
    ],
    feature: { id: '159957', name: 'Piña colada', phrase: 'Ananas et coco, sans alcool.' },
    sections: [
      {
        kind: 'flavors', title: 'Thés glacés maison', price: 3.9,
        rows: [
          { id: '159951', name: 'Ananas coco' },
          { id: '159952', name: 'Fraise framboise' },
          { id: '159949', name: 'Mangue passion' },
          { id: '159953', name: 'Marrakech' },
          { id: '159950', name: 'Pêche litchi' },
        ],
      },
      {
        kind: 'list', title: 'Cocktails sans alcool',
        rows: [
          { id: '159954', name: 'Virgin mojito' },
          { id: '159956', name: 'Virgin mojito fraise' },
          { id: '159955', name: 'Virgin mojito framboise' },
          { id: '159957', name: 'Piña colada' },
          { id: '159958', name: 'Exotic bissap' },
          { id: '1671617', name: 'Exotic ginger petit' },
          { id: '159959', name: 'Exotic ginger grand' },
        ],
      },
    ],
  },
  {
    n: 2,
    eyebrow: 'La vitrine',
    title: 'Desserts maison',
    script: 'préparés chaque matin',
    headline: 'Douceurs maison',
    fx: 'sugar',
    introOffset: 2.9,
    showcase: {
      eyebrow: 'Tous les samedis et dimanches · 11 h – 15 h', title: 'Formule brunch', script: 'compose ton brunch', line: 'Boissons, desserts, saveurs sucrées et salées', price: '25 €', priceLabel: 'la formule',
      items: [
        { id: '159965', name: 'Boisson chaude' }, { id: '159959', name: 'Jus frais' }, { id: '1670503', name: 'Salé' },
        { id: '170320', name: 'Sucré' }, { id: '1603920', name: 'Dessert' },
      ],
    },
    spots: [
      { id: '170326', name: 'Tiramisu pistache', phrase: 'Mascarpone onctueux et pistache torréfiée.' },
      { id: '1603920', name: 'Cheesecake fraise', phrase: 'Biscuit croquant, crème légère, coulis de fraise.' },
    ],
    feature: { id: '173344', name: 'Le Succès', phrase: 'Feuilletage et crème pâtissière.' },
    sections: [
      {
        kind: 'flavors', title: 'Tiramisus maison', price: 5,
        rows: [
          { id: '170322', name: 'Café' },
          { id: '170323', name: 'Caramel' },
          { id: '159968', name: 'Citron' },
          { id: '1604147', name: 'Fraise' },
          { id: '1670543', name: 'Framboise spéculos' },
          { id: '1671619', name: 'Mangue' },
          { id: '1651120', name: 'Nutella' },
          { id: '170324', name: 'Oreo' },
          { id: '170326', name: 'Pistache' },
        ],
      },
      {
        kind: 'list', title: 'Pâtisseries & douceurs',
        rows: [
          { id: '159970', name: 'Cheesecake citron' },
          { id: '1603920', name: 'Cheesecake fraise' },
          { id: '159971', name: 'Crème brûlée vanille' },
          { id: '159969', name: 'Gâteau au chocolat' },
          { id: '170319', name: 'Tartelette citron' },
          { id: '1674503', name: 'Tartelette choco-caramel' },
          { id: '173344', name: 'Le Succès' },
          { id: '1696195', name: 'Trilece' },
          { id: '170320', name: 'Gaufre' },
          { id: '170321', name: 'Riz gluant mangue' },
          { id: '704740', name: 'Salade de fruits' },
          { id: '1695667', name: 'Bonbons' },
        ],
      },
    ],
  },
  {
    n: 3,
    eyebrow: 'Boissons chaudes',
    title: 'Cafés & thés',
    script: 'pause gourmande',
    headline: 'Pause chaude',
    fx: 'steam',
    introOffset: 5.6,
    showcase: {
      eyebrow: 'Au comptoir', title: 'Boissons chaudes', script: 'pause gourmande', line: 'Cafés, chocolat et thés, servis toute la journée', price: '1,80 €', priceLabel: 'à partir de',
      items: [
        { id: '159960', name: 'Expresso' }, { id: '159965', name: 'Cappuccino' }, { id: '159964', name: 'Latte macchiato' },
        { id: '159963', name: 'Chocolat chaud' }, { id: '159966', name: 'Thé parfumé' }, { id: '173371', name: 'Théière' },
      ],
    },
    spots: [
      { id: '159964', name: 'Latte macchiato', phrase: 'Expresso intense et lait mousseux, tout en douceur.' },
      { id: '159963', name: 'Chocolat chaud', phrase: 'Chocolat onctueux, chantilly et copeaux.' },
    ],
    feature: { id: '159965', name: 'Cappuccino', phrase: 'Mousse de lait et cacao.' },
    sections: [
      {
        kind: 'list', title: 'Cafés',
        rows: [
          { id: '159960', name: 'Expresso' },
          { id: '159961', name: 'Double expresso' },
          { id: '159962', name: 'Café allongé' },
          { id: '159967', name: 'Noisette' },
          { id: '159965', name: 'Cappuccino' },
          { id: '159964', name: 'Latte macchiato' },
        ],
      },
      {
        kind: 'list', title: 'Chocolat & thés',
        rows: [
          { id: '159963', name: 'Chocolat chaud' },
          { id: '159966', name: 'Thé parfumé' },
          { id: '173371', name: 'Théière 2 personnes' },
          { id: '173370', name: 'Théière 4 personnes' },
        ],
      },
    ],
  },
]

/* ---------- Brunch ---------- */
export const BRUNCH = {
  days: 'Tous les samedis et dimanches',
  hours: '11 h – 15 h',
  title: 'Formule brunch',
  script: 'compose ton brunch',
  price: '25 €',
  priceLabel: 'la formule',
  contents: ['Boisson chaude', 'Jus frais', 'Salé', 'Sucré', 'Dessert'],
  /* carte explicative */
  details: [
    { t: 'Une boisson chaude', d: 'au choix' },
    { t: 'Un jus frais', d: 'pressé pour toi' },
    { t: 'Une assiette salée', d: 'pour bien commencer' },
    { t: 'Une douceur sucrée', d: 'gourmande et dorée' },
    { t: 'Un dessert maison', d: 'pour finir en beauté' },
  ],
  /* l'assiette : visuels de la carte posés sur la table, du fond vers l'avant */
  plate: [
    { id: '159986', cls: 'b-jus' },
    { id: '159965', cls: 'b-cafe' },
    { id: '1670503', cls: 'b-sale' },
    { id: '170320', cls: 'b-gaufre' },
    { id: '704740', cls: 'b-fruits' },
  ],
}

/* ---------- Listes (moitié d'écran ou écran complet) ---------- */
const sec = (n: number, k: number) => SCREENS[n - 1].sections[k]
export const LISTS: Record<string, { title: string; script: string; eyebrow: string; hero: string[]; rows: Row[]; price?: number; unit?: string }> = {
  chaud: {
    eyebrow: 'Au comptoir · toute la journée', title: 'Boissons chaudes', script: 'pause gourmande', hero: ['159964', '159963'],
    rows: [...sec(3, 0).rows, ...sec(3, 1).rows],
  },
  glaces: { eyebrow: 'Fait maison', title: 'Thés glacés', script: 'servis bien frais', hero: ['159949'], rows: sec(1, 0).rows, price: 3.9, unit: 'le verre' },
  cocktails: { eyebrow: 'Sans alcool', title: 'Cocktails', script: 'faits minute', hero: ['159956', '159957'], rows: sec(1, 1).rows },
  tiramisus: { eyebrow: 'Maison', title: 'Tiramisus', script: 'neuf parfums', hero: ['170326'], rows: sec(2, 0).rows, price: 5, unit: 'la part' },
  patisseries: { eyebrow: 'La vitrine', title: 'Pâtisseries', script: 'préparées chaque matin', hero: ['1603920', '173344'], rows: sec(2, 1).rows },
}

/* ---------- Scènes ---------- */
export type Scene =
  | { kind: 'intro'; ms: number; screen?: number; headline?: string; tag?: string }
  | { kind: 'logo'; ms: number }
  | { kind: 'showcase'; ms: number; screen: number }
  | { kind: 'grid'; ms: number; screen: number }
  | { kind: 'spot'; ms: number; screen: number; spot: number }
  | { kind: 'brunchShow'; ms: number }
  | { kind: 'brunchPhoto'; ms: number }
  | { kind: 'split'; ms: number; left: string; right: string }
  | { kind: 'list'; ms: number; list: string }

/* Déroulé d'une boucle (ms) : identique sur les 3 écrans, qui changent de scène ensemble.
   intro vidéo → logo → écran complet de la catégorie → listes de prix (2 moitiés) → 2 produits mis en scène */
export const loopFor = (n: number): Scene[] => [
  { kind: 'intro', ms: 7000, screen: n },
  { kind: 'logo', ms: 5000 },
  { kind: 'showcase', ms: 10000, screen: n },
  { kind: 'grid', ms: 14000, screen: n },
  { kind: 'spot', ms: 10000, screen: n, spot: 0 },
  { kind: 'spot', ms: 10000, screen: n, spot: 1 },
]
export const SCENES = loopFor(1)
export const LOOP = SCENES.reduce((s, x) => s + x.ms, 0)

/* Programmes à choisir par écran : ecran.html?p=<id> */
export const PROGRAMS: Record<string, { name: string; layout: string; scenes: Scene[] }> = {
  'brunch-chaud': { name: 'Brunch + boissons chaudes', layout: 'Écran divisé', scenes: [{ kind: 'split', ms: 40000, left: 'brunchVisuel', right: 'chaud' }] },
  'brunch-carte': { name: 'Brunch : visuel + carte', layout: 'Écran divisé', scenes: [{ kind: 'split', ms: 40000, left: 'brunchVisuel', right: 'brunchCarte' }] },
  'brunch-photo': { name: 'Brunch plein écran', layout: 'Écran complet', scenes: [{ kind: 'brunchPhoto', ms: 40000 }] },
  'brunch-chaud-anime': { name: 'Brunch + boissons chaudes (animé)', layout: 'Écran divisé', scenes: [
    { kind: 'logo', ms: 5000 }, { kind: 'split', ms: 30000, left: 'brunchVisuel', right: 'chaud' }, { kind: 'brunchPhoto', ms: 16000 },
  ] },
  brunch: { name: 'Le brunch', layout: 'Écran complet', scenes: [
    { kind: 'intro', ms: 7000, headline: 'Le brunch', tag: 'samedi & dimanche' },
    { kind: 'brunchPhoto', ms: 14000 },
    { kind: 'split', ms: 14000, left: 'brunchVisuel', right: 'brunchCarte' },
    { kind: 'logo', ms: 5000 },
  ] },
  'brunch-fixe': { name: 'Le brunch (fixe)', layout: 'Écran complet', scenes: [{ kind: 'brunchPhoto', ms: 40000 }] },
  chaud: { name: 'Boissons chaudes', layout: 'Écran complet', scenes: [
    { kind: 'showcase', ms: 10000, screen: 3 }, { kind: 'list', ms: 16000, list: 'chaud' },
    { kind: 'spot', ms: 9000, screen: 3, spot: 0 }, { kind: 'spot', ms: 9000, screen: 3, spot: 1 },
  ] },
  'chaud-liste': { name: 'Boissons chaudes (liste fixe)', layout: 'Écran complet', scenes: [{ kind: 'list', ms: 40000, list: 'chaud' }] },
  fraicheur: { name: 'Thés glacés & cocktails', layout: 'Écran complet + divisé', scenes: [
    { kind: 'showcase', ms: 10000, screen: 1 }, { kind: 'split', ms: 16000, left: 'glaces', right: 'cocktails' },
    { kind: 'spot', ms: 9000, screen: 1, spot: 0 }, { kind: 'list', ms: 14000, list: 'cocktails' },
  ] },
  'glaces-chaud': { name: 'Thés glacés + boissons chaudes', layout: 'Écran divisé', scenes: [{ kind: 'split', ms: 40000, left: 'glaces', right: 'chaud' }] },
  desserts: { name: 'Desserts', layout: 'Écran complet + divisé', scenes: [
    { kind: 'spot', ms: 9000, screen: 2, spot: 0 }, { kind: 'split', ms: 16000, left: 'tiramisus', right: 'patisseries' },
    { kind: 'spot', ms: 9000, screen: 2, spot: 1 }, { kind: 'list', ms: 14000, list: 'patisseries' },
  ] },
  'brunch-desserts': { name: 'Brunch + pâtisseries', layout: 'Écran divisé', scenes: [{ kind: 'split', ms: 40000, left: 'brunchVisuel', right: 'patisseries' }] },
}
