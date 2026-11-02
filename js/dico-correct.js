// Correction automatique des définitions avant le vote, pour qu'on ne puisse
// pas repérer les fausses définitions à leurs fautes ou à leur mise en forme.
//
// 1. Mise en forme uniforme : espaces, majuscule initiale, point final.
// 2. Orthographe et grammaire : toutes les définitions de la manche sont
//    envoyées en UNE seule requête au service gratuit LanguageTool, et la
//    première suggestion de chaque erreur est appliquée. Le LaTeX ($...$)
//    est protégé et n'est jamais modifié.
//
// Si LanguageTool ne répond pas (pas de réseau, limite atteinte…), le jeu
// continue avec la mise en forme seulement.
const DICO_CORRECTION = {
  enabled: true,
  url: 'https://api.languagetool.org/v2/check',
  language: 'fr',
  timeoutMs: 8000,
  // Types d'erreurs corrigées (on ignore les simples suggestions de style).
  issueTypes: ['misspelling', 'grammar', 'typographical', 'whitespace', 'duplication', 'uncategorized'],
  // Mots que le correcteur ne doit jamais « corriger », en plus de ceux qui
  // apparaissent dans la banque de concepts.
  extraVocabulary: ['valeur-p', 'p-value', 'unilatéral', 'unilatérale', 'bilatéral', 'bilatérale',
    'homoscédasticité', 'hétéroscédasticité', 'khi-deux', 'Student', 'Fisher', 'binomiale', 'iid']
};

function normalizeDefinition(text) {
  let t = (text || '').replace(/\s+/g, ' ').trim();
  if (!t) return t;
  // Majuscule initiale (sauf si la définition commence par une formule).
  t = t.replace(/^(\p{Ll})/u, c => c.toUpperCase());
  // Point final si la phrase se termine par une lettre, un chiffre, une
  // parenthèse, un guillemet ou une formule.
  if (/[\p{L}\p{N})»"'$]$/u.test(t)) t += '.';
  return t;
}

// Découpe un texte en morceaux de texte et de LaTeX ($$...$$ ou $...$).
function splitMath(text) {
  const parts = [];
  const re = /\$\$[\s\S]+?\$\$|\$[^$]+?\$/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ markup: m[0], interpretAs: 'X' });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

function protectedVocabulary() {
  const words = new Set(DICO_CORRECTION.extraVocabulary.map(w => w.toLowerCase()));
  (typeof CONCEPTS !== 'undefined' ? CONCEPTS : []).forEach(c => {
    (c.word + ' ' + c.definition).replace(/\$[^$]*\$/g, ' ')
      .split(/[^\p{L}\p{N}'’-]+/u).forEach(w => { if (w) words.add(w.toLowerCase()); });
  });
  return words;
}

// Retourne une promesse { texts, changes } : les définitions corrigées et
// le nombre de corrections d'orthographe/grammaire appliquées.
function correctDefinitions(texts) {
  const normalized = texts.map(normalizeDefinition);
  if (!DICO_CORRECTION.enabled || normalized.length === 0) {
    return Promise.resolve({ texts: normalized, changes: 0, error: null });
  }

  // Un seul texte : les définitions séparées par une ligne vide.
  const SEP = '\n\n';
  const annotation = [];
  const ranges = [];
  let pos = 0;
  normalized.forEach((t, i) => {
    if (i > 0) { annotation.push({ text: SEP }); pos += SEP.length; }
    ranges.push([pos, pos + t.length]);
    splitMath(t).forEach(p => annotation.push(p));
    pos += t.length;
  });

  const body = new URLSearchParams();
  body.set('language', DICO_CORRECTION.language);
  body.set('data', JSON.stringify({ annotation }));

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), DICO_CORRECTION.timeoutMs) : null;

  return fetch(DICO_CORRECTION.url, { method: 'POST', body, signal: controller && controller.signal })
    .then(res => { if (!res.ok) throw new Error('LanguageTool : HTTP ' + res.status); return res.json(); })
    .then(json => {
      const vocab = protectedVocabulary();
      const out = normalized.slice();
      let changes = 0;
      // On applique les corrections de la fin vers le début pour que les
      // positions restent valides.
      const matches = (json.matches || []).slice().sort((a, b) => b.offset - a.offset);
      const lastStart = normalized.map(() => Infinity);
      matches.forEach(m => {
        const issue = m.rule && m.rule.issueType;
        if (!DICO_CORRECTION.issueTypes.includes(issue)) return;
        if (!m.replacements || !m.replacements.length) return;
        const i = ranges.findIndex(([s, e]) => m.offset >= s && m.offset + m.length <= e);
        if (i < 0) return;
        const start = m.offset - ranges[i][0];
        const end = start + m.length;
        if (end > lastStart[i]) return; // chevauche une correction déjà faite
        const original = normalized[i].slice(start, end);
        if (original.includes('$')) return; // ne touche jamais au LaTeX
        if (issue === 'misspelling' && vocab.has(original.toLowerCase())) return;
        const replacement = m.replacements[0].value;
        out[i] = out[i].slice(0, start) + replacement + out[i].slice(end);
        lastStart[i] = start;
        changes++;
      });
      return { texts: out.map(normalizeDefinition), changes, error: null };
    })
    .catch(err => ({ texts: normalized, changes: 0, error: err.message || String(err) }))
    .finally(() => { if (timer) clearTimeout(timer); });
}
