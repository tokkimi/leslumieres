# Les Lumières — maquette de commande en ligne immersive

Vite + React 18 + TypeScript + Tailwind CSS 4, structure shadcn (`src/components/ui`, `src/lib/utils.ts`, alias `@/`).

```bash
npm install
npm run dev      # développement
npm run build    # build de production (dist/)
```

## Parcours
1. **Entrée** : la façade (store qui ondule au vent), zoom sur la porte qui s'ouvre.
2. **Hero** (`src/components/ui/hero-section-7.tsx`) : plats flottants, bouton « Commander ».
3. **La borne** : écrans du menu + bornes ; la borne s'ouvre en plein écran avec toute la carte.
4. **La vitrine** : les desserts sur les étagères, un tap = ajout au panier.
5. **Le bar** : cocktails, thés glacés, boissons chaudes, softs.
6. **La caisse** : face au comptoir (ticket + TPE), paiement par carte (neumorphisme) ou au comptoir,
   puis « Merci pour votre commande » : les plats apparaissent sur une table.

Le **logo-panier** (en haut à droite) et la **bulle de contact** (en bas à droite) se déplacent au doigt.

## Données
`src/data/menu.json` : les 141 articles et toutes leurs options, extraits du site actuel.
Coordonnées : `src/lib/contact.ts` (e-mail et WhatsApp à renseigner).

## Crédits
Textures : [Poly Haven](https://polyhaven.com) (CC0). Photos des plats et logo : Les Lumières.

Maquette : commande, compte et paiement sont simulés, rien n'est transmis.
