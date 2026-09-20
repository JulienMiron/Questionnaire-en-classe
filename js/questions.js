// Modifie cette liste pour créer ton propre questionnaire.
// - "choices" : les options affichées aux équipes (2 à 6 choix).
// - "correctIndex" : la position (0 = premier choix) de la bonne réponse.
// - "points" : nombre de points accordés pour une bonne réponse à cette question.
// Cette liste reste sur l'appareil de l'animateur : les équipes ne voient
// jamais "correctIndex" avant que l'animateur révèle la réponse.
const QUESTIONS = [
  {
    text: "En régression logistique, quelle fonction relie les prédicteurs à la probabilité de succès ?",
    choices: ["La fonction logit", "La fonction identité", "La fonction exponentielle seule", "La racine carrée"],
    correctIndex: 0,
    points: 100
  },
  {
    text: "Que représente un rapport de cotes (odds ratio) de 2 pour une variable explicative ?",
    choices: [
      "La probabilité de succès double",
      "Les cotes de succès doublent",
      "La variance double",
      "L'effet est nul"
    ],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Quelle capitale se trouve la plus au nord ?",
    choices: ["Ottawa", "Reykjavik", "Oslo", "Helsinki"],
    correctIndex: 1,
    points: 100
  },
  {
    text: "Un modèle linéaire généralisé (GLM) est défini par trois composantes. Laquelle n'en fait PAS partie ?",
    choices: [
      "Une distribution de la variable réponse",
      "Un prédicteur linéaire",
      "Une fonction de lien",
      "Une matrice de corrélation"
    ],
    correctIndex: 3,
    points: 150
  },
  {
    text: "2 + 2 × 2 = ?",
    choices: ["6", "8", "4", "10"],
    correctIndex: 0,
    points: 50
  }
];
