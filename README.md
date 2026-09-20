# Questionnaire en classe

Un jeu-questionnaire par équipes : chaque équipe joue sur son propre appareil
(cellulaire, tablette, ordinateur), et un écran "animateur" projeté en classe
affiche les questions, le déroulement et le pointage de toutes les équipes en
temps réel.

- `index.html` — page d'accueil (choisir Animateur ou Équipe)
- `host.html` — écran de l'animateur (à projeter)
- `play.html` — écran d'une équipe (sur son propre appareil)
- `js/questions.js` — **la banque de questions à modifier**
- `js/firebase-config.js` — la connexion à ta base de données (à configurer)

## Comment ça marche

Les appareils doivent se synchroniser entre eux (les réponses des équipes
doivent arriver à l'animateur, et le pointage doit s'afficher partout).
GitHub Pages n'héberge que des fichiers statiques, il ne peut pas faire ça
tout seul : ce site utilise donc **Firebase Realtime Database**, un service
gratuit de Google, comme "tableau partagé" entre les appareils. Il te faut un
compte Google et environ 5 minutes pour le configurer — voir ci-dessous.

## Étape 1 — Créer un projet Firebase (gratuit)

1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
   et connecte-toi avec un compte Google.
2. Clique **Ajouter un projet**, donne-lui un nom (ex. `quiz-classe`), et
   termine la création (tu peux désactiver Google Analytics, il n'est pas
   nécessaire).
3. Dans le menu de gauche, va dans **Build > Realtime Database**, clique
   **Créer une base de données**, choisis un emplacement, puis démarre
   **en mode test** (règles ouvertes pendant 30 jours — largement assez pour
   un projet de classe ; tu peux resserrer les règles plus tard).
4. Une fois créée, clique l'onglet **Règles** et remplace le contenu par :
   ```json
   {
     "rules": {
       "games": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   Ces règles sont volontairement ouvertes pour que ce soit simple à faire
   fonctionner sans authentification. C'est adapté à un jeu en classe, mais
   ne t'en sers pas pour quelque chose à enjeu élevé (comme un examen noté) :
   n'importe qui connaissant l'URL de ta base pourrait théoriquement lire ou
   modifier les données.
5. Retourne dans **Paramètres du projet** (icône d'engrenage) > onglet
   **Général** > section **Vos applications**. Clique l'icône `</>` (Web),
   donne un surnom à l'application, puis clique **Enregistrer l'application**.
6. Firebase affiche un bloc de code contenant `firebaseConfig = { ... }`.
   Copie ces valeurs dans `js/firebase-config.js`, à la place des valeurs
   `"TON-PROJET"` / `"COLLE_TA_CLE_ICI"`.

## Étape 2 — Modifier les questions

Ouvre `js/questions.js` et remplace la liste `QUESTIONS` par les tiennes.
Chaque question a un texte, une liste de choix, l'index (0, 1, 2…) de la
bonne réponse, et un nombre de points. Le fichier contient des exemples que
tu peux directement écraser.

## Étape 3 — Mettre le site en ligne avec GitHub Pages

1. Crée un nouveau dépôt GitHub (public) et mets-y tous les fichiers de ce
   dossier (`index.html`, `host.html`, `play.html`, `css/`, `js/`, ce
   `README.md`).
2. Dans le dépôt sur GitHub : **Settings > Pages**.
3. Sous **Build and deployment**, choisis la branche `main` (dossier `/root`),
   puis **Save**.
4. Après une minute ou deux, GitHub affiche l'adresse du site (quelque chose
   comme `https://tonnomdusager.github.io/nom-du-depot/`). C'est cette
   adresse que tu partages avec ta classe.

## Utilisation en classe

1. Sur ton ordinateur/projecteur, ouvre le site et clique **Je suis
   l'animateur**, puis **Créer la partie**. Un code à 4 chiffres apparaît.
2. Chaque équipe ouvre le site sur son propre appareil, clique **Je suis une
   équipe**, entre le code et un nom d'équipe.
3. Une fois toutes les équipes présentes, clique **Commencer la partie** sur
   l'écran animateur.
4. Pour chaque question : laisse les équipes répondre, clique **Révéler la
   réponse** (les points sont calculés automatiquement), puis **Question
   suivante**.
5. À la fin, le classement final s'affiche sur tous les écrans.

## Limites à connaître (et pistes d'amélioration)

- Les équipes ne peuvent rejoindre qu'avant le début de la partie (pas en
  cours de route).
- Le pointage est fixe par question (pas de bonus de rapidité) — tu peux en
  ajouter un dans `js/host.js`, à l'endroit où les points sont calculés lors
  de la révélation.
- Les règles Firebase en mode test expirent après 30 jours ; il suffit d'y
  retourner et de les remettre (voir Étape 1.4) si tu réutilises le projet
  plus tard.
