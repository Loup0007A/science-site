# Nexploria

Laboratoire de science interactive : 100 simulations (fractales, chaos, ondes, automates…) qui tournent dans le navigateur, sans framework ni dépendance externe.

Site en ligne : <https://nexploria-2.netlify.app/>

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page d'accueil : contenu, styles, et un petit chargeur de script inline |
| `js/app.js` | Interface : thème, recherche, filtres, aperçus, modale, routage `/experience/…` et `/categorie/…` |
| `js/exp-1.js` … `js/exp-5.js` | Les 100 expériences, en 5 lots chargés en parallèle après `app.js` |
| `404.html`, `js/404.js` | Page « introuvable » |
| `fonts/` | Polices auto-hébergées (Syne, Instrument Sans, IBM Plex Mono — licence SIL OFL) |
| `_redirects` | Réécrit `/experience/*` et `/categorie/*` vers `index.html` |
| `_headers` | En-têtes de sécurité (CSP, COOP, X-Frame-Options…) — **généré**, voir ci-dessous |
| `scripts/build-headers.mjs` | Génère `_headers` |
| `netlify.toml` | Lance `scripts/build-headers.mjs` à chaque déploiement Netlify |

## Ajouter une expérience

1. Ajoutez la carte dans `index.html` (copiez une carte existante) : `data-id`, `data-cats`, et un lien `href="/experience/mon-slug"`. Le slug sert d'URL.
2. Définissez `EXPS.monId = { tag, title, hint, info, preview(c, g) {…}, setup(canvas, ctx, add) {…} }` dans l'un des fichiers `js/exp-*.js`.
3. Dans les boucles d'animation, utilisez `raf = expRAF(loop)` (et `expInterval` au lieu de `setInterval`) : la boucle s'arrête d'elle-même à la fermeture.
4. Ajoutez l'URL dans `sitemap.xml`.

`info` accepte uniquement `<strong>`, `<em>`, `<b>`, `<i>`, `<br>`, `<sub>`, `<sup>`, `<code>`, `<small>` (sans attributs) : tout le reste est affiché comme du texte.

## Sécurité (CSP stricte + Trusted Types)

La CSP n'autorise que les scripts inline dont l'empreinte SHA-256 figure dans `_headers` ; ceux-ci chargent ensuite `js/*.js` grâce à `'strict-dynamic'`. Les fichiers `js/*.js` peuvent donc être modifiés librement.

Si vous modifiez un `<script>` **inline** d'une page HTML, régénérez les en-têtes :

```sh
node scripts/build-headers.mjs          # réécrit _headers
node scripts/build-headers.mjs --check  # vérifie qu'il est à jour
```

Netlify le fait automatiquement à chaque déploiement (voir `netlify.toml`).

N'ajoutez pas de gestionnaires inline (`onclick="…"`) ni de scripts tiers : ils seraient bloqués par la CSP. Toute insertion de HTML doit passer par `setRichText()` (politique Trusted Types `nexploria`).

## Newsletter

Le formulaire utilise Netlify Forms. Activez la détection des formulaires dans l'interface Netlify (section *Forms*) pour recevoir les inscriptions ; sinon le formulaire affiche un message d'erreur au lieu de faire semblant d'enregistrer l'adresse.
