// Banque de concepts du jeu du dictionnaire.
// - "word" : le concept affiché à tout le monde.
// - "definition" : la vraie définition. Elle est remise, au hasard, à un seul
//   joueur par manche, qui ne peut pas la modifier.
// - "explanation" (facultatif) : un commentaire affiché à l'animateur au
//   moment de la révélation, pour lancer la discussion.
//
// Conseil : écris la vraie définition dans le style que les étudiants
// imiteront (une ou deux phrases, sans notation trop « manuel »), sinon elle
// se repère trop facilement.
//
// LaTeX : entoure les formules de $...$ et double chaque backslash
// (\\alpha, \\theta_0, etc.).
const CONCEPTS = [
  {
    word: "Puissance d'un test",
    definition: "La probabilité de rejeter $H_0$ lorsque $H_1$ est vraie.",
    explanation: "C'est $1-\\beta$. Bluffs fréquents : $1-\\alpha$, ou « la probabilité de prendre la bonne décision »."
  },
  {
    word: "Valeur-p",
    definition: "La probabilité, en supposant $H_0$ vraie, d'obtenir une statistique de test au moins aussi extrême que celle observée, dans la direction de $H_1$.",
    explanation: "Ce n'est pas la probabilité que $H_0$ soit vraie."
  },
  {
    word: "Seuil de signification",
    definition: "La probabilité de rejeter $H_0$ alors qu'elle est vraie, fixée avant de regarder les données.",
    explanation: "Noté $\\alpha$. Ce n'est pas « la probabilité de se tromper quand on rejette $H_0$ »."
  },
  {
    word: "Erreur de type I",
    definition: "Rejeter $H_0$ alors qu'elle est vraie.",
    explanation: "Sa probabilité est $\\alpha$."
  },
  {
    word: "Erreur de type II",
    definition: "Ne pas rejeter $H_0$ alors que $H_1$ est vraie.",
    explanation: "Sa probabilité est $\\beta$ ; elle dépend de la vraie valeur du paramètre."
  },
  {
    word: "Hypothèse nulle",
    definition: "Un énoncé sur un paramètre de la population, qu'on conserve tant que les données ne fournissent pas suffisamment de preuves contre lui.",
    explanation: "Elle porte sur un paramètre (par ex. $\\mu = \\mu_0$), jamais sur une statistique comme $\\bar{x}$."
  },
  {
    word: "Hypothèse alternative",
    definition: "L'énoncé sur un paramètre de la population que le chercheur souhaite appuyer avec les données.",
    explanation: "C'est $H_1$ qu'on cherche à démontrer, pas $H_0$."
  },
  {
    word: "Statistique de test",
    definition: "Une fonction des données, dont la loi est connue sous $H_0$, qui mesure l'écart entre l'estimation et la valeur postulée du paramètre.",
    explanation: "Par ex. $T = \\dfrac{\\bar{X}-\\mu_0}{S/\\sqrt{n}}$."
  },
  {
    word: "Région critique",
    definition: "L'ensemble des valeurs de la statistique de test qui mènent au rejet de $H_0$.",
    explanation: "Aussi appelée région de rejet. À ne pas confondre avec un intervalle de confiance."
  },
  {
    word: "Valeur critique",
    definition: "La valeur qui sépare la région critique des valeurs de la statistique de test pour lesquelles on ne rejette pas $H_0$.",
    explanation: "Par ex. $t_{0{,}05;\\,24} = 1{,}711$ pour un test unilatéral à droite."
  },
  {
    word: "Test unilatéral",
    definition: "Un test dont l'hypothèse alternative porte sur un seul côté de la valeur postulée du paramètre.",
    explanation: "Bluff classique : « un test qui porte sur un seul échantillon »."
  },
  {
    word: "Résultat statistiquement significatif",
    definition: "Un résultat qui mène au rejet de $H_0$ au seuil de signification fixé.",
    explanation: "Significatif ne veut pas dire important en pratique."
  }
];
