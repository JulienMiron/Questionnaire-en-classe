(function () {
  const progressEl = document.getElementById('preview-progress');
  const textEl = document.getElementById('preview-question-text');
  const gridEl = document.getElementById('preview-choices-grid');
  const prevBtn = document.getElementById('preview-prev-btn');
  const nextBtn = document.getElementById('preview-next-btn');
  const revealBtn = document.getElementById('preview-reveal-btn');

  let idx = 0;

  function render() {
    const q = QUESTIONS[idx];
    progressEl.textContent = `Question ${idx + 1} / ${QUESTIONS.length}`;
    textEl.textContent = q.text;
    gridEl.innerHTML = '';
    q.choices.forEach((choice, i) => {
      const div = document.createElement('div');
      div.className = 'btn choice-btn';
      div.textContent = choice;
      div.dataset.index = i;
      gridEl.appendChild(div);
    });
    renderMathIn(textEl);
    renderMathIn(gridEl);

    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === QUESTIONS.length - 1;
    revealBtn.disabled = false;
    revealBtn.textContent = 'Afficher la réponse';
  }

  revealBtn.addEventListener('click', () => {
    const q = QUESTIONS[idx];
    Array.from(gridEl.children).forEach(div => {
      if (Number(div.dataset.index) === q.correctIndex) div.classList.add('is-correct');
    });
    revealBtn.disabled = true;
    revealBtn.textContent = 'Réponse affichée';
  });

  prevBtn.addEventListener('click', () => {
    if (idx > 0) {
      idx -= 1;
      render();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (idx < QUESTIONS.length - 1) {
      idx += 1;
      render();
    }
  });

  render();
})();
