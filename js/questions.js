// Modifie cette liste pour créer ton propre questionnaire.
// - "choices" : les options affichées aux équipes (2 à 6 choix).
// - "correctIndex" : la position (0 = premier choix) de la bonne réponse.
// - "points" : nombre de points accordés pour une bonne réponse à cette question.
// Cette liste reste sur l'appareil de l'animateur : les équipes ne voient
// jamais "correctIndex" avant que l'animateur révèle la réponse.
//
// LaTeX : écris des mathématiques dans "text" ou dans "choices" en les
// entourant de $...$ (en ligne) ou $$...$$ (centré, sur sa propre ligne).
// Chaque backslash du LaTeX doit être doublé dans la chaîne JavaScript.
const QUESTIONS = [
  {
    text: "Un chercheur recrute des étudiants volontaires dans son propre cours pour un sondage. De quel type d'échantillon s'agit-il ?",
    choices: [
      "Échantillon aléatoire simple",
      "Échantillon stratifié",
      "Échantillon de convenance",
      "Échantillon par grappes"
    ],
    correctIndex: 2,
    points: 100
  },
  {
    text: "Pour un échantillonnage systématique avec $N = 10\\,000$ et $n = 200$, quel est le pas de sélection $k$ ?",
    choices: ["$200$", "$20$", "$10\\,000$", "$50$"],
    correctIndex: 3,
    points: 100
  },
  {
    text: "Quelle méthode consiste à diviser la population en sous-groupes homogènes puis à effectuer un EAS indépendant dans chacun ?",
    choices: [
      "Échantillonnage par grappes",
      "Échantillonnage systématique",
      "Échantillonnage stratifié",
      "Échantillon raisonné"
    ],
    correctIndex: 2,
    points: 100
  },
  {
    text: "Quelle méthode consiste à sélectionner aléatoirement quelques sous-groupes puis à interroger tous les individus de ces sous-groupes ?",
    choices: [
      "Échantillon de convenance",
      "Échantillonnage aléatoire simple",
      "Échantillonnage stratifié",
      "Échantillonnage par grappes"
    ],
    correctIndex: 3,
    points: 100
  },
  {
    text: "Vrai ou faux : dans un échantillonnage probabiliste, chaque individu de la population a une probabilité égale d'être sélectionné.",
    choices: ["Vrai", "Faux"],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Quel est le principal inconvénient de l'échantillonnage par grappes par rapport à l'EAS ?",
    choices: [
      "Il nécessite une base de sondage complète",
      "Il est moins précis, car les individus d'une même grappe tendent à se ressembler",
      "Il ne permet jamais de généraliser à la population",
      "Il est toujours plus coûteux que l'EAS"
    ],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Utiliser un annuaire téléphonique de lignes fixes comme base de sondage pour étudier la population générale illustre surtout quel type de biais ?",
    choices: ["Biais de sélection", "Biais de non-réponse", "Biais de couverture", "Biais de mesure"],
    correctIndex: 2,
    points: 100
  },
  {
    text: "Un sondage en ligne, qui rejoindra surtout les personnes à l'aise avec ce mode de communication, illustre surtout quel type de biais ?",
    choices: ["Biais de couverture", "Biais de sélection", "Biais de mesure", "Biais de non-réponse"],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Laquelle de ces formulations illustre le mieux un biais de mesure par question orientée (suggestive) ?",
    choices: [
      "« Consommez-vous des boissons énergisantes ? »",
      "« Quelle est votre opinion sur les boissons énergisantes ? »",
      "« À quelle fréquence dormez-vous 8 heures par nuit ? »",
      "« Êtes-vous d'accord que les boissons énergisantes sont nuisibles à la santé ? »"
    ],
    correctIndex: 3,
    points: 100
  },
  {
    text: "Vrai ou faux : un taux de non-réponse élevé entraîne toujours un biais de non-réponse.",
    choices: ["Vrai", "Faux"],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Soit l'échantillon $1, 2, 3, 4, 5, 6, 7$. On change la valeur $7$ en $2519$. Que peut-on dire du comportement de sa moyenne et de sa médiane ?",
    choices: [
      "La moyenne et la médiane restent toutes les deux à $4$",
      "La moyenne est fortement influencée par $2519$, alors que la médiane reste à $4$",
      "La médiane devient plus grande que la moyenne",
      "Aucune des deux mesures n'est affectée par la valeur $2519$"
    ],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Quelle est la formule de la variance échantillonnale $s^2$ ?",
    choices: [
      "$$s^2 = \\dfrac{\\sum_{i=1}^n (x_i - \\bar{x})^2}{n}$$",
      "$$s^2 = \\dfrac{\\sum_{i=1}^n (x_i - \\bar{x})}{n-1}$$",
      "$$s^2 = \\sum_{i=1}^n (x_i - \\bar{x})^2$$",
      "$$s^2 = \\dfrac{\\sum_{i=1}^n (x_i - \\bar{x})^2}{n-1}$$"
    ],
    correctIndex: 3,
    points: 100
  },
  {
    text: "Vrai ou faux : la somme des écarts $x_i - \\bar{x}$ pour toutes les observations d'un échantillon est toujours égale à $0$.",
    choices: ["Vrai", "Faux"],
    correctIndex: 0,
    points: 100
  },
  {
    text: "Quel est le principal inconvénient de l'étendue comme mesure de dispersion ?",
    choices: [
      "Elle ne tient compte que des deux valeurs extrêmes et ignore toute l'information entre les deux",
      "Elle est impossible à calculer pour de grands échantillons",
      "Elle est toujours négative",
      "Elle nécessite de connaître la moyenne de la population"
    ],
    correctIndex: 0,
    points: 100
  },
  {
    text: "Les trois quartiles $Q1$, $Q2$ et $Q3$ divisent un échantillon ordonné en combien de groupes de fréquence égale ?",
    choices: ["2", "4", "3", "5"],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Qu'est-ce qui distingue une fonction de répartition $F$ d'une variable aléatoire de sa fonction de densité $f$ (cas continu) ?",
    choices: [
      "$F(x) = P(X \\le x)$ alors que $f$ n'est pas elle-même une probabilité",
      "$F$ et $f$ sont deux noms pour la même fonction",
      "$f(x)$ donne toujours une valeur entre $0$ et $1$, contrairement à $F$",
      "$F$ est utilisée seulement pour les variables discrètes"
    ],
    correctIndex: 0,
    points: 100
  },
  {
    text: "Pour une variable aléatoire continue $X$, que vaut $P(X = 3)$ ?",
    choices: ["Cela dépend de la densité en $x = 3$", "$0$", "$f(3)$", "$1$ si $3$ appartient au support"],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Quelle relation relie la fonction de répartition $F$ et la fonction de densité $f$ d'une variable continue ?",
    choices: [
      "$$F(x) = \\int_{-\\infty}^{x} f(t)\\,dt$$",
      "$$f(x) = \\int_{-\\infty}^{x} F(t)\\,dt$$",
      "$F(x) = f'(x)$",
      "Elles ne sont pas reliées"
    ],
    correctIndex: 0,
    points: 100
  },
    {
    text: "Un dé pipé à 6 faces est lancé, où la probabilité d'obtenir la face $i$ est proportionnelle à $i$, pour $i = 1, 2, 3, 4, 5, 6$. Quelle est l'espérance $E(X)$ du résultat obtenu ?",
    choices: ["$3$", "$3{,}5$", "$\\dfrac{91}{21} \\approx 4{,}33$", "$21$"],
    correctIndex: 2,
    points: 100,
    timeLimit: 60
  },
  {
    text: "Si $Y = 2X + 5$, comment se comporte la variance de $Y$ par rapport à celle de $X$ ?",
    choices: [
      "$\\text{Var}(Y) = 2\\,\\text{Var}(X) + 5$",
      "$\\text{Var}(Y) = 4\\,\\text{Var}(X)$",
      "$\\text{Var}(Y) = 2\\,\\text{Var}(X)$",
      "$\\text{Var}(Y) = 4\\text{Var}(X) + 25$"
    ],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Que doit obligatoirement satisfaire une fonction de densité $f$ sur l'ensemble des réels ?",
    choices: [
      "$$f(x) \\ge 0 \\text{ partout et } \\int_{-\\infty}^{\\infty} f(x)\\,dx = 1$$",
      "$f(x) \\le 1$ partout",
      "$f$ est une fonction croissante",
      "$$\\int_{-\\infty}^{\\infty} f(x)\\,dx = 0$$"
    ],
    correctIndex: 0,
    points: 100
  },
];
