// Banque de questions du Jeopardy (STT-2902, inspirée de l'examen 1 A26).
//
// - Une catégorie = une colonne du tableau ; "questions" doit être dans l'ordre
//   croissant de valeur.
// - "value" : points gagnés (ou perdus, si la pénalité est activée).
// - "time" : durée du minuteur, en secondes. Il varie selon la difficulté et
//   le nombre de calculs ; il n'a aucun effet sur les points.
// - "text" et "answer" acceptent du LaTeX entre $...$ ou $$...$$
//   (chaque backslash doit être doublé dans la chaîne JavaScript).
const JEOPARDY = {
  title: "STT-2902 — Révision de l'examen 1",
  categories: [
    {
      name: "Échantillonnage",
      questions: [
        {
          value: 100,
          time: 30,
          text: "Pour sonder ses résidents, le Service des résidences affiche un code QR menant au questionnaire à l'entrée des cafétérias. Quel type d'échantillonnage est-ce ?",
          answer: "Un échantillonnage <strong>non probabiliste</strong> : un échantillon de convenance formé de volontaires."
        },
        {
          value: 200,
          time: 45,
          text: "On veut sélectionner $n = 180$ personnes parmi $N = 3\\,600$ par échantillonnage systématique. Quel est le pas $k$ ? Si le nombre tiré au hasard est $r = 7$, quelles sont les trois premières positions sélectionnées ?",
          answer: "$k = N/n = 3\\,600/180 = 20$. Positions $7$, $27$ et $47$ (puis $67, 87, \\ldots$)."
        },
        {
          value: 300,
          time: 60,
          text: "Une résidence de $2\\,400$ étudiants compte quatre pavillons de $400$, $600$, $800$ et $600$ résidents. Avec un échantillonnage stratifié <em>proportionnel</em> de taille $n = 240$ (strates = pavillons), combien de résidents sélectionne-t-on dans chaque pavillon, et comment ?",
          answer: "Fraction de sondage $240/2\\,400 = 0{,}1$, donc $40$, $60$, $80$ et $60$ résidents, tirés par un EAS indépendant dans chaque pavillon."
        },
        {
          value: 400,
          time: 60,
          text: "On demande : « Sachant que les experts recommandent au moins 8 heures de sommeil par nuit, combien d'heures dormez-vous en moyenne ? » Quel type de biais cette question introduit-elle ? Proposez une meilleure formulation.",
          answer: "Un <strong>biais de mesure</strong> : la question est orientée (suggestive) et favorise la désirabilité sociale, ce qui pousse à surestimer ses heures de sommeil.<br>Mieux : « En moyenne, combien d'heures dormez-vous par nuit ? »"
        },
        {
          value: 500,
          time: 60,
          text: "Les résidents du pavillon C dorment en moyenne 1,2 heure de moins que les autres. Le Service conclut qu'habiter au pavillon C <em>cause</em> un manque de sommeil. Pourquoi cette conclusion n'est-elle pas justifiée ? Donnez un exemple.",
          answer: "C'est une <strong>étude observationnelle</strong> : les résidents n'ont pas été assignés aléatoirement aux pavillons. Une <strong>variable confondante</strong> peut expliquer l'écart (ex. le pavillon C loge surtout un programme très exigeant, ou il est près d'une rue bruyante). On montre une association, pas une causalité."
        }
      ]
    },
    {
      name: "Statistiques descriptives",
      questions: [
        {
          value: 100,
          time: 30,
          text: "Laquelle de la moyenne ou de la médiane est robuste aux valeurs extrêmes ?",
          answer: "La <strong>médiane</strong>."
        },
        {
          value: 200,
          time: 60,
          text: "Heures de sommeil de 10 résidents : $$5{,}5 \\quad 6 \\quad 6 \\quad 6{,}5 \\quad 7 \\quad 7 \\quad 7{,}5 \\quad 8 \\quad 8 \\quad 9$$ avec $\\sum x_i = 70{,}5$. Calculez la moyenne et la médiane.",
          answer: "$\\bar{x} = 70{,}5/10 = 7{,}05$ h. Médiane $= (7+7)/2 = 7$ h (moyenne des 5<sup>e</sup> et 6<sup>e</sup> valeurs)."
        },
        {
          value: 300,
          time: 60,
          text: "Aux 10 observations précédentes ($\\sum x_i = 70{,}5$, $\\bar{x} = 7{,}05$, médiane $7$), on ajoute un 11<sup>e</sup> résident qui dort 2 heures. Que deviennent la moyenne et la médiane ?",
          answer: "Moyenne : $72{,}5/11 \\approx 6{,}59$ h. Médiane : toujours $7$ h (la 6<sup>e</sup> des 11 valeurs ordonnées). Seule la moyenne est affectée."
        },
        {
          value: 400,
          time: 90,
          text: "Pour les 10 observations ($n = 10$), on a $\\sum x_i = 70{,}5$ et $\\sum x_i^2 = 507{,}75$. Calculez la variance échantillonnale $s^2$ et l'écart-type $s$.",
          answer: "$$s^2 = \\frac{\\sum x_i^2 - n\\bar{x}^2}{n-1} = \\frac{507{,}75 - 10(7{,}05)^2}{9} = \\frac{10{,}725}{9} \\approx 1{,}192$$ donc $s \\approx 1{,}092$ h."
        },
        {
          value: 500,
          time: 75,
          text: "Diagramme en boîte du pavillon C : $Q_1 = 5{,}5$, médiane $= 6$, $Q_3 = 6{,}5$. Une résidente déclare dormir 10 heures. Calculez l'écart interquartile et déterminez si 10 h est une valeur aberrante selon la règle de $1{,}5 \\times EI$.",
          answer: "$EI = 6{,}5 - 5{,}5 = 1$. Limite supérieure : $Q_3 + 1{,}5 \\times EI = 6{,}5 + 1{,}5 = 8$. Comme $10 > 8$, c'est une <strong>valeur aberrante</strong>."
        }
      ]
    },
    {
      name: "Estimation ponctuelle",
      questions: [
        {
          value: 100,
          time: 30,
          text: "Que signifie qu'un estimateur $\\hat{\\theta}$ est sans biais pour $\\theta$ ?",
          answer: "$E(\\hat{\\theta}) = \\theta$, c'est-à-dire que son biais $E(\\hat{\\theta}) - \\theta$ est nul."
        },
        {
          value: 200,
          time: 45,
          text: "$X_1, \\ldots, X_n$ est un échantillon aléatoire d'espérance $\\mu$ et de variance $\\sigma^2$. On pose $$\\hat{\\mu}_2 = \\frac{X_1 + X_n}{2}.$$ Calculez $E(\\hat{\\mu}_2)$. Est-il sans biais ?",
          answer: "$E(\\hat{\\mu}_2) = \\dfrac{E(X_1) + E(X_n)}{2} = \\dfrac{\\mu + \\mu}{2} = \\mu$. Oui, il est sans biais."
        },
        {
          value: 300,
          time: 60,
          text: "Avec le même $\\hat{\\mu}_2 = \\dfrac{X_1 + X_n}{2}$ (observations indépendantes de variance $\\sigma^2$), calculez $V(\\hat{\\mu}_2)$.",
          answer: "Par indépendance, $V(\\hat{\\mu}_2) = \\dfrac{V(X_1) + V(X_n)}{4} = \\dfrac{2\\sigma^2}{4} = \\dfrac{\\sigma^2}{2}$."
        },
        {
          value: 400,
          time: 75,
          text: "Sachant que $V(\\bar{X}) = \\sigma^2/n$ et $V(\\hat{\\mu}_2) = \\sigma^2/2$ (deux estimateurs sans biais), calculez l'efficacité relative de $\\bar{X}$ par rapport à $\\hat{\\mu}_2$. Lequel préfère-t-on ?",
          answer: "$$\\frac{EQM(\\bar{X})}{EQM(\\hat{\\mu}_2)} = \\frac{\\sigma^2/n}{\\sigma^2/2} = \\frac{2}{n} \\le 1.$$ On préfère $\\bar{X}$ (strictement dès que $n \\ge 3$ ; pour $n = 2$ ils coïncident)."
        },
        {
          value: 500,
          time: 90,
          text: "Sachant que $E(S^2) = \\sigma^2$ où $S^2 = \\frac{1}{n-1}\\sum (X_i - \\bar{X})^2$, calculez le biais de l'estimateur $$\\hat{\\sigma}^2 = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2.$$",
          answer: "$\\hat{\\sigma}^2 = \\dfrac{n-1}{n} S^2$, donc $E(\\hat{\\sigma}^2) = \\dfrac{n-1}{n}\\sigma^2$ et le biais vaut $-\\dfrac{\\sigma^2}{n}$ (il sous-estime $\\sigma^2$, mais le biais tend vers $0$)."
        }
      ]
    },
    {
      name: "Intervalles de confiance",
      questions: [
        {
          value: 100,
          time: 45,
          text: "$[496{,}6\\,;\\ 499{,}8]$ est un intervalle de confiance de niveau $95\\,\\%$ pour $\\mu$. Peut-on dire que $P(496{,}6 \\le \\mu \\le 499{,}8) = 0{,}95$ ? Pourquoi ?",
          answer: "<strong>Non.</strong> Une fois observé, l'intervalle contient $\\mu$ ou ne le contient pas. Le $95\\,\\%$ se rapporte à la méthode : avant d'observer les données, l'intervalle <em>aléatoire</em> $[L\\,;U]$ contient $\\mu$ avec probabilité $0{,}95$."
        },
        {
          value: 200,
          time: 45,
          text: "Toutes choses étant égales par ailleurs, si on <strong>quadruple</strong> la taille d'échantillon, qu'arrive-t-il à la marge d'erreur de l'IC pour $\\mu$ (variance connue) ?",
          answer: "Elle est <strong>divisée par 2</strong>, car elle vaut $z_{\\alpha/2}\\,\\sigma/\\sqrt{n}$ et $\\sqrt{4n} = 2\\sqrt{n}$."
        },
        {
          value: 300,
          time: 120,
          text: "Volume d'eau (mL) de $n = 20$ bouteilles, loi normale, $\\sigma$ inconnu : $\\bar{x} = 498{,}2$ et $s = 3{,}5$. Construisez un IC de niveau $95\\,\\%$ pour $\\mu$.<br><small>$t_{0{,}025;19} = 2{,}093$ ; $z_{0{,}025} = 1{,}96$</small>",
          answer: "$$498{,}2 \\pm 2{,}093 \\cdot \\frac{3{,}5}{\\sqrt{20}} = 498{,}2 \\pm 1{,}638$$ soit $[496{,}56\\,;\\ 499{,}84]$ mL."
        },
        {
          value: 400,
          time: 90,
          text: "On suppose maintenant $\\sigma = 3{,}5$ mL connu. Quelle taille d'échantillon minimale faut-il pour que la marge d'erreur de l'IC de niveau $95\\,\\%$ pour $\\mu$ soit d'au plus 1 mL ?<br><small>$z_{0{,}025} = 1{,}96$</small>",
          answer: "$$n \\ge \\left(\\frac{z_{0{,}025}\\,\\sigma}{e}\\right)^2 = \\left(\\frac{1{,}96 \\times 3{,}5}{1}\\right)^2 = 47{,}06$$ donc <strong>$n = 48$</strong> bouteilles (on arrondit vers le haut)."
        },
        {
          value: 500,
          time: 150,
          text: "Avec $n = 20$ et $s = 3{,}5$ mL (loi normale), construisez un IC de niveau $95\\,\\%$ pour $\\sigma^2$.<br><small>$\\chi^2_{0{,}025;19} = 32{,}85$ ; $\\chi^2_{0{,}975;19} = 8{,}91$</small>",
          answer: "$$\\left[\\frac{(n-1)s^2}{\\chi^2_{0{,}025;19}}\\,;\\ \\frac{(n-1)s^2}{\\chi^2_{0{,}975;19}}\\right] = \\left[\\frac{232{,}75}{32{,}85}\\,;\\ \\frac{232{,}75}{8{,}91}\\right] = [7{,}085\\,;\\ 26{,}122]$$"
        }
      ]
    }
  ]
};
