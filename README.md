# Les Lumières — maquette du site de commande

Refonte de la page d'accueil et du parcours de commande de [restaurantleslumieres.fr](https://www.restaurantleslumieres.fr/).
Site statique (HTML/CSS/JS, aucune dépendance) : ouvrir `index.html` ou déployer le dossier tel quel.

## Ce qui est repris du site actuel
- **Toute la carte** : 16 rubriques, 141 articles, prix identiques (`assets/data/menu.js`).
- **Toutes les options de commande** de chaque plat : cuisson, accompagnement, frites, sauce maison,
  sauce frites (affichée seulement si des frites sont choisies, comme sur le site actuel),
  garniture thaï + suppléments, boissons / thés glacés / cocktails, dessert, ingrédients à retirer.
  Les choix obligatoires sont vérifiés avant l'ajout au panier.
- Modes **À emporter / Sur place**, paiements **CB, espèces, ticket restaurant, chèque déjeuner**,
  connexion et création de compte (mêmes champs que l'actuel).
- Adresse, téléphone, logo (détouré en PNG transparent : `assets/img/logo-blanc.png`, `logo-noir.png`).

## Direction artistique
Façade noire et lettrage blanc, lumière tamisée chaude (ambre), effets neumorphiques sur fond sombre.
Polices du site actuel (Montserrat, Oxygen Mono) + une script pour la signature « depuis 2020 ».
Écran de chargement : l'ampoule du logo s'allume en vacillant.

## Limites de la maquette
Front uniquement : la commande, la connexion et le compte sont simulés (rien n'est envoyé au logiciel de caisse).
Le panier est conservé dans le navigateur (localStorage).
