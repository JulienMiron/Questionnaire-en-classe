// Convertit le LaTeX écrit dans questions.js (entre $...$ ou $$...$$) en
// notation mathématique affichée, à l'intérieur de l'élément donné.
// Appelée après chaque mise à jour de texte de question ou de choix.
function renderMathIn(el) {
  if (!el || typeof renderMathInElement !== 'function') return;
  renderMathInElement(el, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '\\(', right: '\\)', display: false },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false
  });
}
