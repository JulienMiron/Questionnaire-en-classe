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
          text: "Un sondage de l'association étudiante demande : « Ne croyez-vous pas que les frais de stationnement sur le campus sont beaucoup trop élevés ? » Quel type de biais cette question introduit-elle ? Proposez une meilleure formulation.",
          answer: "Un <strong>biais de mesure</strong> : la question est orientée (suggestive) et pousse les répondants à se dire d'accord.<br>Mieux : « Selon vous, les frais de stationnement sur le campus sont-ils trop élevés, adéquats ou trop bas ? »"
        },
        {
          value: 500,
          time: 60,
          text: "Une enquête montre que les étudiants qui fréquentent la bibliothèque au moins trois fois par semaine ont une moyenne cumulative plus élevée que les autres. L'Université conclut que fréquenter la bibliothèque <em>cause</em> de meilleurs résultats. Pourquoi cette conclusion n'est-elle pas justifiée ? Donnez un exemple.",
          answer: "C'est une <strong>étude observationnelle</strong> : les étudiants n'ont pas été assignés aléatoirement à fréquenter ou non la bibliothèque. Une <strong>variable confondante</strong> peut expliquer l'écart (ex. la motivation ou le nombre d'heures d'étude, qui augmentent à la fois la fréquentation et les notes). On montre une association, pas une causalité."
        },
        {
          value: 600,
          time: 120,
          text: "La liste des $2\\,400$ résidents (une chambre chacun) est ordonnée par pavillon, étage, puis numéro de chambre. Chaque corridor compte exactement $10$ chambres et la 10<sup>e</sup> est toujours collée à la cage d'escalier (bruyante). On sélectionne $n = 240$ résidents par échantillonnage systématique pour estimer leurs heures de sommeil. Quelle proportion de chambres bruyantes l'échantillon contiendra-t-il, comparativement à la population ? Qu'en concluez-vous et que proposez-vous ?",
          answer: "$k = 2\\,400/240 = 10$, soit exactement la période de la liste. Si $r = 10$, les $240$ résidents sont tous dans une chambre bruyante ($100\\,\\%$) ; sinon, aucun ne l'est ($0\\,\\%$). Or la population en compte $10\\,\\%$. L'échantillon n'est donc jamais représentatif : c'est un <strong>biais dû à la périodicité</strong> de la liste, qui coïncide avec le pas.<br>Solutions : mélanger aléatoirement la liste avant le tirage, faire un EAS, ou stratifier selon la position de la chambre dans le corridor."
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
          text: "Temps de trajet (minutes) entre le domicile et le campus de 10 étudiants : $$12 \\quad 15 \\quad 18 \\quad 20 \\quad 22 \\quad 22 \\quad 25 \\quad 28 \\quad 30 \\quad 38$$ avec $\\sum x_i = 230$. Calculez la moyenne et la médiane.",
          answer: "$\\bar{x} = 230/10 = 23$ min. Médiane $= (22+22)/2 = 22$ min (moyenne des 5<sup>e</sup> et 6<sup>e</sup> valeurs)."
        },
        {
          value: 300,
          time: 60,
          text: "Nombre de cafés consommés par semaine par 9 étudiants : $$1 \\quad 2 \\quad 3 \\quad 4 \\quad 5 \\quad 5 \\quad 6 \\quad 8 \\quad 11$$ La moyenne et la médiane valent toutes deux $5$. On ajoute un 10<sup>e</sup> étudiant qui en boit $40$. Que deviennent la moyenne et la médiane ?",
          answer: "Moyenne : $(45 + 40)/10 = 8{,}5$ cafés. Médiane : $(5+5)/2 = 5$ cafés (moyenne des 5<sup>e</sup> et 6<sup>e</sup> valeurs), inchangée. Seule la moyenne est affectée."
        },
        {
          value: 400,
          time: 90,
          text: "Nombre d'heures de travail rémunéré par semaine de $n = 8$ étudiants : on a $\\sum x_i = 104$ et $\\sum x_i^2 = 1\\,806$. Calculez la variance échantillonnale $s^2$ et l'écart-type $s$.",
          answer: "$\\bar{x} = 104/8 = 13$, puis $$s^2 = \\frac{\\sum x_i^2 - n\\bar{x}^2}{n-1} = \\frac{1\\,806 - 8(13)^2}{7} = \\frac{454}{7} \\approx 64{,}86$$ donc $s \\approx 8{,}05$ h."
        },
        {
          value: 500,
          time: 75,
          text: "Diagramme en boîte du loyer mensuel (en dollars) des 3½ près du campus : $Q_1 = 850$, médiane $= 950$, $Q_3 = 1\\,050$. Un appartement est affiché à $1\\,400$ dollars. Calculez l'écart interquartile et déterminez si ce loyer est une valeur aberrante selon la règle de $1{,}5 \\times EI$.",
          answer: "$EI = 1\\,050 - 850 = 200$. Limite supérieure : $Q_3 + 1{,}5 \\times EI = 1\\,050 + 300 = 1\\,350$. Comme $1\\,400 > 1\\,350$, c'est une <strong>valeur aberrante</strong>."
        },
        {
          value: 600,
          time: 150,
          text: "Heures de sport par semaine de 8 étudiants : $$3 \\quad 3 \\quad 4 \\quad 5 \\quad 6 \\quad 8 \\quad 9 \\quad 10$$ avec $\\sum x_i = 48$ et $\\sum x_i^2 = 340$. Un 9<sup>e</sup> étudiant, athlète de compétition, déclare $24$ h. Calculez la moyenne, la médiane et l'écart-type <em>avant</em> et <em>après</em> l'ajout. Lesquelles de ces mesures sont robustes ?",
          answer: "Avant : $\\bar{x} = 6$, médiane $= (5+6)/2 = 5{,}5$, $s^2 = \\dfrac{340 - 8(6)^2}{7} = \\dfrac{52}{7}$, donc $s \\approx 2{,}73$ h.<br>Après : $\\sum x_i = 72$ et $\\sum x_i^2 = 340 + 24^2 = 916$, donc $\\bar{x} = 8$, médiane $= 6$ (5<sup>e</sup> valeur) et $$s^2 = \\frac{916 - 9(8)^2}{8} = \\frac{340}{8} = 42{,}5, \\quad s \\approx 6{,}52 \\text{ h}.$$ Seule la <strong>médiane</strong> est robuste : la moyenne augmente de $2$ h et l'écart-type fait plus que doubler."
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
          text: "$X_1, \\ldots, X_n$ est un échantillon aléatoire (observations indépendantes) d'espérance $\\mu$ et de variance $\\sigma^2$. On pose $$\\hat{\\mu} = \\frac{2X_1 + X_2}{3}.$$ Calculez $V(\\hat{\\mu})$.",
          answer: "Par indépendance, $V(\\hat{\\mu}) = \\dfrac{4V(X_1) + V(X_2)}{9} = \\dfrac{4\\sigma^2 + \\sigma^2}{9} = \\dfrac{5\\sigma^2}{9}$."
        },
        {
          value: 400,
          time: 75,
          text: "$X_1, \\ldots, X_n$ ($n \\ge 3$) est un échantillon aléatoire de variance $\\sigma^2$. Les estimateurs sans biais $\\bar{X}$ et $T = \\dfrac{X_1 + X_2 + X_3}{3}$ ont pour variances $V(\\bar{X}) = \\sigma^2/n$ et $V(T) = \\sigma^2/3$. Calculez l'efficacité relative de $\\bar{X}$ par rapport à $T$. Lequel préfère-t-on et dans quelle condition ?",
          answer: "$$\\frac{EQM(\\bar{X})}{EQM(T)} = \\frac{\\sigma^2/n}{\\sigma^2/3} = \\frac{3}{n} \\le 1.$$ On préfère $\\bar{X}$ dès que $n > 3$ (le rapport est alors $< 1$). Si $n = 3$, $\\bar{X} = T$ : les deux estimateurs sont identiques."
        },
        {
          value: 500,
          time: 90,
          text: "Sachant que $E(S^2) = \\sigma^2$ où $S^2 = \\frac{1}{n-1}\\sum (X_i - \\bar{X})^2$, calculez le biais de l'estimateur $$\\hat{\\sigma}^2 = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2.$$",
          answer: "$\\hat{\\sigma}^2 = \\dfrac{n-1}{n} S^2$, donc $E(\\hat{\\sigma}^2) = \\dfrac{n-1}{n}\\sigma^2$ et le biais vaut $-\\dfrac{\\sigma^2}{n}$ (il sous-estime $\\sigma^2$, mais le biais tend vers $0$)."
        },
        {
          value: 600,
          time: 150,
          text: "$X_1, \\ldots, X_n$ est un échantillon aléatoire d'espérance $\\mu$ et de variance $\\sigma^2$. On pose $$T = \\frac{1}{n+1}\\sum_{i=1}^n X_i = \\frac{n}{n+1}\\,\\bar{X}.$$ Calculez le biais et l'EQM de $T$. Si $n = 4$ et $\\mu = \\sigma$, lequel de $T$ ou de $\\bar{X}$ préfère-t-on ?<br><small>$EQM(\\hat{\\theta}) = V(\\hat{\\theta}) + [\\text{biais}(\\hat{\\theta})]^2$</small>",
          answer: "$E(T) = \\dfrac{n\\mu}{n+1}$, donc biais $= -\\dfrac{\\mu}{n+1}$. $V(T) = \\dfrac{n^2}{(n+1)^2}\\cdot\\dfrac{\\sigma^2}{n} = \\dfrac{n\\sigma^2}{(n+1)^2}$, d'où $$EQM(T) = \\frac{n\\sigma^2 + \\mu^2}{(n+1)^2}.$$ Avec $n = 4$ et $\\mu = \\sigma$ : $EQM(T) = \\dfrac{5\\sigma^2}{25} = \\dfrac{\\sigma^2}{5}$ et $EQM(\\bar{X}) = \\dfrac{\\sigma^2}{4}$. L'efficacité relative de $T$ par rapport à $\\bar{X}$ vaut $\\dfrac{4}{5} < 1$ : on préfère $T$, même s'il est <strong>biaisé</strong>."
        }
      ]
    },
    {
      name: "Intervalles de confiance",
      questions: [
        {
          value: 100,
          time: 45,
          text: "Une étude rapporte que $[12{,}4\\,;\\ 15{,}8]$ minutes est un intervalle de confiance de niveau $95\\,\\%$ pour le temps d'attente moyen $\\mu$ à la cafétéria. Peut-on dire que $P(12{,}4 \\le \\mu \\le 15{,}8) = 0{,}95$ ? Pourquoi ?",
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
          text: "Le volume de jus dans des berlingots suit une loi normale d'écart-type connu $\\sigma = 2{,}5$ mL. Quelle taille d'échantillon minimale faut-il pour que la marge d'erreur de l'IC de niveau $95\\,\\%$ pour $\\mu$ soit d'au plus 1 mL ?<br><small>$z_{0{,}025} = 1{,}96$</small>",
          answer: "$$n \\ge \\left(\\frac{z_{0{,}025}\\,\\sigma}{e}\\right)^2 = \\left(\\frac{1{,}96 \\times 2{,}5}{1}\\right)^2 = 24{,}01$$ donc <strong>$n = 25$</strong> berlingots (on arrondit vers le haut)."
        },
        {
          value: 500,
          time: 150,
          text: "La masse (g) de $n = 20$ sacs de café, supposée de loi normale, a un écart-type échantillonnal $s = 4{,}2$ g. Construisez un IC de niveau $95\\,\\%$ pour $\\sigma^2$.<br><small>$\\chi^2_{0{,}025;19} = 32{,}85$ ; $\\chi^2_{0{,}975;19} = 8{,}91$</small>",
          answer: "$$\\left[\\frac{(n-1)s^2}{\\chi^2_{0{,}025;19}}\\,;\\ \\frac{(n-1)s^2}{\\chi^2_{0{,}975;19}}\\right] = \\left[\\frac{335{,}16}{32{,}85}\\,;\\ \\frac{335{,}16}{8{,}91}\\right] = [10{,}203\\,;\\ 37{,}616]$$"
        },
        {
          value: 600,
          time: 240,
          text: "Le temps (en minutes) entre deux passages d'autobus suit une loi exponentielle d'espérance $\\theta$. Pour un échantillon aléatoire $X_1, \\ldots, X_n$, on sait que $$W = \\frac{2\\sum_{i=1}^n X_i}{\\theta} \\sim \\chi^2_{2n}.$$ Déduisez un IC de niveau $1-\\alpha$ pour $\\theta$, puis calculez-le au niveau $95\\,\\%$ si $n = 10$ et $\\sum x_i = 32$.<br><small>$\\chi^2_{0{,}025;20} = 34{,}17$ ; $\\chi^2_{0{,}975;20} = 9{,}59$</small>",
          answer: "$$P\\left(\\chi^2_{1-\\alpha/2;2n} \\le \\frac{2\\sum X_i}{\\theta} \\le \\chi^2_{\\alpha/2;2n}\\right) = 1-\\alpha.$$ En isolant $\\theta$ (tout est positif, donc les inégalités s'inversent) : $$\\left[\\frac{2\\sum X_i}{\\chi^2_{\\alpha/2;2n}}\\,;\\ \\frac{2\\sum X_i}{\\chi^2_{1-\\alpha/2;2n}}\\right].$$ Ici : $[64/34{,}17\\,;\\ 64/9{,}59] = [1{,}873\\,;\\ 6{,}674]$ minutes. Le plus grand quantile va dans la borne inférieure."
        }
      ]
    }
  ]
};
