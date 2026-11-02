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
    definition: "La probabilité de rejeter H0 lorsque H1 est vraie.",
    explanation: "C'est $1-\\beta$. Bluffs fréquents : $1-\\alpha$, ou « la probabilité de prendre la bonne décision »."
  },
  {
    word: "Valeur-p",
    definition: "La probabilité, en supposant H0 vraie, d'obtenir une statistique de test au moins aussi extrême que celle observée, dans la direction de H1.",
    explanation: "Ce n'est pas la probabilité que H0 soit vraie."
  },
  {
    word: "Seuil de signification",
    definition: "La probabilité de rejeter H0 alors qu'elle est vraie, fixée avant de regarder les données.",
    explanation: "Noté $\\alpha$. Ce n'est pas « la probabilité de se tromper quand on rejette H0 »."
  },
  {
    word: "Erreur de type I",
    definition: "Rejeter H0 alors qu'elle est vraie.",
    explanation: "Sa probabilité est $\\alpha$."
  },
  {
    word: "Erreur de type II",
    definition: "Ne pas rejeter H0 alors que H1 est vraie.",
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
    explanation: "C'est H1 qu'on cherche à démontrer, pas H0."
  },
  {
    word: "Statistique de test",
    definition: "Une fonction des données, dont la loi est connue sous H0, qui mesure l'écart entre l'estimation et la valeur postulée du paramètre.",
    explanation: "Par ex. $T = \\dfrac{\\bar{X}-\\mu_0}{S/\\sqrt{n}}$."
  },
  {
    word: "Région critique",
    definition: "L'ensemble des valeurs de la statistique de test qui mènent au rejet de H0.",
    explanation: "Aussi appelée région de rejet. À ne pas confondre avec un intervalle de confiance."
  },
  {
    word: "Valeur critique",
    definition: "La valeur qui sépare la région critique des valeurs de la statistique de test pour lesquelles on ne rejette pas H0.",
    explanation: "Par ex. $t_{0{,}05;\\,24} = 1{,}711$ pour un test unilatéral à droite."
  },
  {
    word: "Test unilatéral",
    definition: "Un test dont l'hypothèse alternative porte sur un seul côté de la valeur postulée du paramètre.",
    explanation: "Bluff classique : « un test qui porte sur un seul échantillon »."
  },
  {
    word: "Résultat statistiquement significatif",
    definition: "Un résultat qui mène au rejet de H0 au seuil de signification fixé.",
    explanation: "Significatif ne veut pas dire important en pratique."
  },
  {
    word: "Test bilatéral",
    definition: "Un test dont l'hypothèse alternative couvre les deux côtés de la valeur postulée du paramètre.",
    explanation: "Par ex. H1 : $\\mu \\neq \\mu_0$. Bluff classique : « un test qui compare deux échantillons »."
  },
  {
    word: "Règle de décision",
    definition: "La règle, fixée avant de voir les données, qui indique pour quelles valeurs de la statistique de test on rejette H0.",
    explanation: "Par ex. « rejeter H0 si $t_{\\text{obs}} > t_{\\alpha;\\,n-1}$ », ou de façon équivalente « si la valeur-p est inférieure à $\\alpha$ »."
  },
  {
    word: "Loi de la statistique de test sous H0",
    definition: "La loi que suit la statistique de test lorsqu'on suppose que l'hypothèse nulle est vraie.",
    explanation: "C'est elle qui sert à calculer la valeur-p et les valeurs critiques (par ex. une Student à $n-1$ degrés de liberté)."
  },
  {
    word: "Valeur observée de la statistique de test",
    definition: "Le nombre obtenu en calculant la statistique de test avec les données de l'échantillon.",
    explanation: "Notée par ex. $t_{\\text{obs}}$ ; on la compare à la valeur critique ou on s'en sert pour calculer la valeur-p."
  },
  {
    word: "Ne pas rejeter H0",
    definition: "Conclure que les données ne fournissent pas suffisamment de preuves contre l'hypothèse nulle.",
    explanation: "Ce n'est pas « accepter H0 » ni « prouver que H0 est vraie »."
  },
  {
    word: "Fonction de puissance",
    definition: "La fonction qui donne, pour chaque valeur possible du paramètre, la probabilité de rejeter H0.",
    explanation: "Sous H0, elle vaut $\\alpha$ ; elle augmente à mesure que le paramètre s'éloigne de la valeur postulée et que $n$ augmente."
  },
  {
    word: "Test $t$ pour une moyenne",
    definition: "Un test sur la moyenne d'une population normale dont la variance est inconnue, basé sur une loi de Student à $n-1$ degrés de liberté.",
    explanation: "$T = \\dfrac{\\bar{X}-\\mu_0}{S/\\sqrt{n}}$ suit une $t_{n-1}$ sous H0."
  }
];
