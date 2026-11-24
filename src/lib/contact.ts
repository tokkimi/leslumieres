/** Coordonnées affichées dans la bulle de contact. Laisser `null` tant qu'une info n'est pas confirmée. */
export const CONTACT = {
  phone: '01 60 05 25 08',
  phoneHref: 'tel:+33160052508',
  email: null as string | null,
  whatsapp: null as string | null, // numéro mobile au format international, ex. '33612345678'
  address: '31-33 avenue Ampère, 77420 Champs-sur-Marne',
  maps: 'https://www.google.com/maps/search/?api=1&query=31-33+Avenue+Amp%C3%A8re+77420+Champs-sur-Marne',
}

/** Moyens de paiement. Logos officiels détourés (Wikimedia Commons) ; Chèque Déjeuner : logo officiel à fournir. */
export const PAIEMENTS: { label: string; logos: string[]; icon?: 'cash'; wordmark?: string }[] = [
  { label: 'Carte bancaire', logos: ['/assets/img/paiement/cb.svg', '/assets/img/paiement/visa.svg', '/assets/img/paiement/mastercard.svg'] },
  { label: 'Espèces', logos: [], icon: 'cash' },
  { label: 'Ticket Restaurant', logos: ['/assets/img/paiement/edenred.svg'] },
  { label: 'Chèque Déjeuner', logos: [], wordmark: 'Chèque Déjeuner' },
]
