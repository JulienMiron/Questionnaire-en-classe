# Jeux en classe

La page d'accueil (`index.html`) propose deux jeux :

- **Jeu du dictionnaire** (`dictionnaire.html`) — décrit ci-dessous ;
- **Jeopardy** (`jeopardy.html`) — voir la section [Jeopardy](#jeopardy) à la fin.

# Jeu du dictionnaire

C'est le jeu du dictionnaire, appliqué aux concepts de statistique. À chaque
manche, un concept s'affiche (par exemple « Puissance d'un test »). Chaque
joueur écrit, sur son propre appareil, une **fausse définition crédible**. Un
joueur choisi au hasard reçoit plutôt la **vraie définition**, qu'il ne peut
pas modifier. Toutes les définitions sont ensuite mélangées et affichées au
tableau, et chacun vote pour celle qu'il croit vraie.

- `dictionnaire.html` : accueil du jeu (choisir Animateur ou Joueur)
- `dictionnaire-animateur.html` / `js/dico-host.js` : écran de l'animateur (à projeter)
- `dictionnaire-joueur.html` / `js/dico-play.js` : écran d'un joueur (sur son appareil)
- `js/concepts.js` : **la banque de concepts à modifier**
- `js/dico-settings.js` : chronos et pointage
- `js/firebase-config.js` : la connexion à la base de données Firebase

## Déroulement

1. Sur l'ordinateur relié au projecteur, ouvre **Jeu du dictionnaire > Je suis
   l'animateur**, puis clique **Créer la partie**. Un code à 4 chiffres apparaît.
2. Chaque étudiant ouvre **Je suis un joueur** sur son appareil et s'inscrit
   avec le code et son nom. Il faut au moins 2 joueurs. On peut aussi
   s'inscrire en cours de partie.
3. Clique **Commencer la partie**. Le concept s'affiche sur tous les écrans.
   - Un joueur tiré au hasard voit la vraie définition dans un encadré non
     modifiable. Le tirage se fait parmi les joueurs qui ont détenu la vraie
     définition le moins souvent, pour que le rôle tourne.
   - Les autres écrivent leur fausse définition dans l'encadré, puis cliquent
     **Envoyer**. Ils peuvent la modifier jusqu'au début du vote.
   - L'écran de l'animateur affiche le nombre de définitions reçues, sans
     montrer qui détient la vraie.
4. Clique **Passer au vote** (le passage se fait aussi automatiquement à la
   fin du chrono). Les définitions sont mélangées et identifiées par A, B, C…
   Chaque joueur vote sur son appareil. Personne ne peut voter pour sa propre
   définition, et le joueur qui détient la vraie ne vote pas. Un vote ne peut
   pas être changé.
5. La révélation se fait dès que tout le monde a voté, à la fin du chrono, ou
   quand tu cliques **Révéler la vraie définition**. Le tableau montre alors la
   vraie définition, l'auteur de chaque fausse définition et qui a voté pour
   quoi. Il affiche aussi le commentaire prévu dans `concepts.js` pour lancer
   la discussion.
6. Clique **Manche suivante**, ou **Terminer la partie** pour afficher le
   classement final. Pendant l'écriture, **Changer de concept** passe au
   concept suivant si celui en cours ne convient pas.

## Pointage

Le pointage se règle dans `js/dico-settings.js` :

- 2 points pour un vote sur la vraie définition ;
- 1 point à l'auteur d'une fausse définition pour chaque vote qu'elle reçoit ;
- 2 points au détenteur de la vraie définition si personne ne la trouve.

Les boutons **−1 / +1** à côté de chaque joueur permettent un ajustement
manuel. Ils servent par exemple à récompenser un joueur dont la « fausse »
définition était en fait juste.

## Modifier les concepts

Dans `js/concepts.js`, chaque concept a un `word`, une `definition` (la vraie)
et, si tu le souhaites, une `explanation` affichée à la révélation. Les
concepts sont joués dans l'ordre de la liste. Le LaTeX est accepté entre
`$...$`, avec les backslashs doublés (`\\alpha`). Les joueurs peuvent aussi
écrire du LaTeX dans leurs définitions.

Conseil : rédige les vraies définitions dans un style simple, que les
étudiants peuvent imiter. Sinon, la vraie se repère à sa formulation de
manuel.

## Reconnexion

- **Joueur :** s'il rafraîchit la page, il reprend automatiquement sa place.
  Sur un autre appareil, il s'inscrit à nouveau avec le même code et
  **exactement le même nom** (les majuscules ne comptent pas).
- **Animateur :** tout l'état de la partie est dans Firebase. Quand tu rouvres
  `dictionnaire-animateur.html`, un bouton **Reprendre la partie** apparaît.

## Firebase

Le jeu utilise le projet Firebase déjà configuré dans `js/firebase-config.js`,
avec les règles suivantes (onglet **Règles** de la Realtime Database) :
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
Ces règles sont ouvertes : un étudiant habile qui fouille les outils de
développement de son navigateur pourrait voir quelle définition est la vraie.
C'est sans conséquence pour un jeu en classe, mais ne t'en sers pas pour une
évaluation notée. Les règles en « mode test » expirent après 30 jours. Il
suffit de les remettre si le jeu cesse de fonctionner.

# Jeopardy

Un tableau de Jeopardy à projeter en classe. Tout se passe sur l'écran de
l'animateur : **pas de connexion, pas de code de partie, pas de Firebase**.

- `jeopardy.html` / `js/jeopardy.js` — le jeu
- `js/jeopardy-questions.js` — **la banque de questions à modifier**
  (actuellement : révision de l'examen 1 A26 de STT-2902, en quatre
  catégories : échantillonnage, statistiques descriptives, estimation
  ponctuelle, intervalles de confiance)

## Déroulement

1. Sur la page d'accueil, choisis **Jeopardy**, indique le nombre d'équipes
   (2 à 8) et, si tu veux, leurs noms.
2. Coche **Une mauvaise réponse fait perdre la valeur de la question** si tu
   veux la règle du vrai Jeopardy ; sinon, une mauvaise réponse vaut 0.
3. Clique une case : la question s'affiche et son minuteur démarre. Le temps
   alloué (`time`, en secondes) dépend de la difficulté et du nombre de
   calculs ; il **n'a aucun effet sur les points**. Un signal sonore retentit
   quand il est écoulé. Barre d'espace : pause/reprise.
4. **Afficher la réponse**, puis clique **✓ Réussi** ou **✗ Raté** pour
   chaque équipe concernée (un second clic annule). Plusieurs équipes
   peuvent réussir la même question.
5. **Retour au tableau** (ou Échap) : la case devient grise, avec une pastille
   de la couleur de chaque équipe qui l'a réussie. On peut la rouvrir pour
   corriger un résultat.

Les boutons **−100 / +100** sous chaque équipe permettent un ajustement
manuel, et **Classement** affiche le classement en tout temps. La partie est
enregistrée dans le navigateur : un rafraîchissement accidentel ne fait rien
perdre (**Nouvelle partie** remet tout à zéro).

## Modifier les questions

Dans `js/jeopardy-questions.js`, chaque catégorie a un nom et une liste de
questions avec `value`, `time`, `text` et `answer`. Le texte et la réponse
acceptent du LaTeX (`$...$`, `$$...$$`, backslashs doublés) et un peu de HTML
(`<strong>`, `<br>`, `<small>`).
