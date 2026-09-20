// Modifie cette liste pour créer ton propre questionnaire.
// - "choices" : les options affichées aux équipes (2 à 6 choix).
// - "correctIndex" : la position (0 = premier choix) de la bonne réponse.
// - "points" : nombre de points accordés pour une bonne réponse à cette question.
// Cette liste reste sur l'appareil de l'animateur : les équipes ne voient
// jamais "correctIndex" avant que l'animateur révèle la réponse.
const QUESTIONS = [
  {
    text: "Vrai ou faux : une étude observationnelle permet de conclure à un lien de causalité entre deux variables.",
    choices: ["Vrai", "Faux"],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Qu'est-ce qui caractérise une expérience bien conçue ?",
    choices: [
      "Le fait d'observer les individus sans intervenir",
      "L'attribution aléatoire des individus aux groupes de traitement",
      "Le fait de choisir soi-même les sujets jugés représentatifs",
      "L'absence de groupe témoin"
    ],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Dans un essai clinique en double aveugle, qui ne connaît pas l'appartenance de chaque sujet à un groupe ?",
    choices: [
      "Seulement les évaluateurs",
      "Seulement les sujets",
      "Le chercheur principal seulement",
      "Ni les sujets ni les évaluateurs"
    ],
    correctIndex: 3,
    points: 100
  },
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
    text: "Dans un échantillonnage aléatoire simple (EAS) de $n$ individus parmi une population de $N$, quelle est la probabilité pour chaque individu d'être sélectionné ?",
    choices: ["$N/n$", "$1/N$", "$n/N$", "$1/n$"],
    correctIndex: 2,
    points: 150
  },
  {
    text: "Pour un échantillonnage systématique avec $N = 10\\,000$ et $n = 200$, quel est le pas de sélection $k$ ?",
    choices: ["$200$", "$20$", "$10\\,000$", "$50$"],
    correctIndex: 3,
    points: 150
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
    points: 150
  },
  {
    text: "Utiliser un annuaire téléphonique de lignes fixes comme base de sondage pour étudier la population générale illustre surtout quel type de biais ?",
    choices: ["Biais de sélection", "Biais de non-réponse", "Biais de couverture", "Biais de mesure"],
    correctIndex: 2,
    points: 100
  },
  {
    text: "Un sondage en ligne, qui rejoindra surtout les pertsonnes à l'aise avec ce mode de communication, illustre surtout quel type de biais ?",
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
    points: 150
  },
  {
    text: "Qu'est-ce qui distingue une fonction de répartition F d'une variable aléatoire de sa fonction de densité f (cas continu) ?",
    choices: [
      "F(x) = P(X ≤ x) alors que f n'est pas elle-même une probabilité",
      "F et f sont deux noms pour la même fonction",
      "f(x) donne toujours une valeur entre 0 et 1, contrairement à F",
      "F est utilisée seulement pour les variables discrètes"
    ],
    correctIndex: 0,
    points: 100
  },
  {
    text: "Pour une variable aléatoire continue X, que vaut P(X = 3) ?",
    choices: ["Cela dépend de la densité en x = 3", "0", "f(3)", "1 si 3 appartient au support"],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Quelle relation relie la fonction de répartition F et la fonction de densité f d'une variable continue ?",
    choices: [
      "F(x) = ∫ de −∞ à x de f(t) dt",
      "f(x) = ∫ de −∞ à x de F(t) dt",
      "F(x) = f '(x), sans aucune exception possible",
      "Elles ne sont pas reliées"
    ],
    correctIndex: 0,
    points: 100
  },
  {
    text: "Un dé équilibré à 6 faces est lancé. Quelle est l'espérance du résultat obtenu ?",
    choices: ["3", "3,5", "4", "21"],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Laquelle de ces formules calcule correctement la variance de X ?",
    choices: [
      "Var(X) = E(X²) − [E(X)]²",
      "Var(X) = E(X) − E(X²)",
      "Var(X) = [E(X)]² − E(X²)",
      "Var(X) = E(X²) + [E(X)]²"
    ],
    correctIndex: 0,
    points: 100
  },
  {
    text: "Si Y = 2X + 5, comment se comporte la variance de Y par rapport à celle de X ?",
    choices: ["Var(Y) = 2·Var(X) + 5", "Var(Y) = 4·Var(X)", "Var(Y) = 2·Var(X)", "Var(Y) = Var(X) + 5"],
    correctIndex: 1,
    points: 150
  },
  {
    text: "Pour une loi uniforme continue sur l'intervalle [2, 8], quelle est l'espérance ?",
    choices: ["5", "3", "8", "6"],
    correctIndex: 0,
    points: 100
  },
  {
    text: "Que doit obligatoirement satisfaire une fonction de densité f sur l'ensemble des réels ?",
    choices: [
      "f(x) ≥ 0 partout et l'aire totale sous f vaut 1",
      "f(x) ≤ 1 partout",
      "f est une fonction croissante",
      "L'aire totale sous f vaut 0"
    ],
    correctIndex: 0,
    points: 100
  },
  {
    text: "Laquelle de ces propriétés est vraie pour toute fonction de répartition F ?",
    choices: [
      "F est non décroissante, avec F(x) → 0 quand x → −∞ et F(x) → 1 quand x → +∞",
      "F est toujours strictement croissante",
      "F(x) peut prendre des valeurs négatives",
      "F est symétrique autour de 0"
    ],
    correctIndex: 0,
    points: 100
  }
];