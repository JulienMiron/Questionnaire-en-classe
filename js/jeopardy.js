// Jeopardy en classe : tout se passe sur l'écran de l'animateur, sans
// connexion ni Firebase. L'état de la partie est gardé dans le navigateur
// (localStorage) pour survivre à un rafraîchissement accidentel.
(function () {
  const STORAGE_KEY = 'jeopardy-partie-v1';
  const MIN_TEAMS = 2;
  const MAX_TEAMS = 8;
  const NB_COLORS = 8;

  const $ = id => document.getElementById(id);

  // ---------- État ----------
  // teams    : [{ name }]
  // penalty  : true si une mauvaise réponse retire la valeur de la question
  // results  : { "c-q": { "indexÉquipe": "ok" | "ko" } }
  // used     : { "c-q": true } — cases déjà jouées
  // adjust   : [ajustement manuel par équipe]
  let state = null;
  let setupCount = 4;
  let setupNames = [];

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function clearSaved() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* rien */ }
  }

  const key = (c, q) => `${c}-${q}`;
  const question = k => {
    const [c, q] = k.split('-').map(Number);
    return { cat: JEOPARDY.categories[c], q: JEOPARDY.categories[c].questions[q] };
  };

  function scores() {
    const s = state.teams.map((_, i) => state.adjust[i] || 0);
    Object.entries(state.results).forEach(([k, byTeam]) => {
      const { q } = question(k);
      Object.entries(byTeam).forEach(([t, r]) => {
        if (r === 'ok') s[t] += q.value;
        else if (r === 'ko' && state.penalty) s[t] -= q.value;
      });
    });
    return s;
  }

  // ---------- Configuration ----------
  function renderSetupNames() {
    const box = $('jp-team-names');
    // conserve ce qui a déjà été tapé
    box.querySelectorAll('input').forEach((inp, i) => { setupNames[i] = inp.value; });
    box.innerHTML = '';
    for (let i = 0; i < setupCount; i++) {
      const row = document.createElement('div');
      row.className = `jp-name-row team-color-${i % NB_COLORS}`;
      row.innerHTML = '<span class="team-dot"></span>';
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.maxLength = 30;
      inp.placeholder = `Équipe ${i + 1}`;
      inp.value = setupNames[i] || '';
      row.appendChild(inp);
      box.appendChild(row);
    }
    $('jp-team-count').textContent = setupCount;
    $('jp-team-minus').disabled = setupCount <= MIN_TEAMS;
    $('jp-team-plus').disabled = setupCount >= MAX_TEAMS;
  }

  $('jp-team-minus').addEventListener('click', () => {
    if (setupCount > MIN_TEAMS) { setupCount--; renderSetupNames(); }
  });
  $('jp-team-plus').addEventListener('click', () => {
    if (setupCount < MAX_TEAMS) { setupCount++; renderSetupNames(); }
  });

  $('jp-start-btn').addEventListener('click', () => {
    const inputs = $('jp-team-names').querySelectorAll('input');
    const teams = Array.from(inputs).map((inp, i) => ({ name: inp.value.trim() || `Équipe ${i + 1}` }));
    state = {
      teams,
      penalty: $('jp-penalty').checked,
      results: {},
      used: {},
      adjust: teams.map(() => 0)
    };
    save();
    showGame();
  });

  $('jp-resume-btn').addEventListener('click', showGame);

  function showSetup() {
    $('jp-game').style.display = 'none';
    $('jp-setup').style.display = '';
    $('jp-resume-panel').style.display = load() ? '' : 'none';
    renderSetupNames();
  }

  // ---------- Tableau ----------
  function showGame() {
    state = state || load();
    if (!state) return showSetup();
    $('jp-setup').style.display = 'none';
    $('jp-game').style.display = '';
    renderBoard();
    renderScores();
  }

  function renderBoard() {
    const grid = $('jp-grid');
    const cats = JEOPARDY.categories;
    const rows = Math.max(...cats.map(c => c.questions.length));
    grid.style.setProperty('--jp-cols', cats.length);
    grid.innerHTML = '';

    cats.forEach(cat => {
      const h = document.createElement('div');
      h.className = 'jp-cat';
      h.textContent = cat.name;
      grid.appendChild(h);
    });

    for (let r = 0; r < rows; r++) {
      cats.forEach((cat, c) => {
        const q = cat.questions[r];
        const cell = document.createElement('button');
        cell.className = 'jp-cell';
        if (!q) { cell.disabled = true; cell.classList.add('is-empty'); grid.appendChild(cell); return; }
        const k = key(c, r);
        cell.textContent = q.value;
        if (state.used[k]) {
          cell.classList.add('is-used');
          const winners = Object.entries(state.results[k] || {})
            .filter(([, v]) => v === 'ok').map(([t]) => Number(t));
          if (winners.length) {
            const dots = document.createElement('span');
            dots.className = 'jp-cell-dots';
            winners.forEach(t => {
              const d = document.createElement('span');
              d.className = `team-dot team-color-${t % NB_COLORS}`;
              d.title = state.teams[t] ? state.teams[t].name : '';
              dots.appendChild(d);
            });
            cell.appendChild(dots);
          }
        }
        cell.setAttribute('aria-label', `${cat.name}, ${q.value} points${state.used[k] ? ' (déjà jouée)' : ''}`);
        cell.addEventListener('click', () => openQuestion(k));
        grid.appendChild(cell);
      });
    }

    $('jp-game-title').textContent = JEOPARDY.title || 'Jeopardy';
  }

  function renderScores() {
    const s = scores();
    const ul = $('jp-scores');
    ul.innerHTML = '';
    state.teams.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = `jp-score team-color-${i % NB_COLORS}`;
      li.innerHTML = `
        <span class="jp-score-name"><span class="team-dot"></span><span></span></span>
        <span class="jp-score-value">${s[i]}</span>
        <span class="jp-score-adjust">
          <button class="btn jp-small" data-d="-100" title="Retirer 100 points">−100</button>
          <button class="btn jp-small" data-d="100" title="Ajouter 100 points">+100</button>
        </span>`;
      li.querySelector('.jp-score-name span:last-child').textContent = t.name;
      li.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => {
        state.adjust[i] = (state.adjust[i] || 0) + Number(b.dataset.d);
        save();
        renderScores();
      }));
      ul.appendChild(li);
    });
  }

  $('jp-new-btn').addEventListener('click', () => {
    if (!confirm('Commencer une nouvelle partie ? Le pointage actuel sera effacé.')) return;
    setupNames = state.teams.map(t => t.name);
    setupCount = state.teams.length;
    $('jp-penalty').checked = state.penalty;
    clearSaved();
    state = null;
    showSetup();
  });

  // ---------- Classement ----------
  $('jp-ranking-btn').addEventListener('click', showRanking);
  $('jp-ranking-close').addEventListener('click', () => { $('jp-ranking').style.display = 'none'; });

  function showRanking() {
    const s = scores();
    const order = state.teams.map((t, i) => ({ t, i, s: s[i] })).sort((a, b) => b.s - a.s);
    const total = JEOPARDY.categories.reduce((n, c) => n + c.questions.length, 0);
    const done = Object.keys(state.used).length;
    $('jp-ranking-title').textContent = done >= total ? 'Classement final' : `Classement (${done} / ${total} questions)`;
    const ul = $('jp-ranking-list');
    ul.innerHTML = '';
    let rank = 0, prev = null;
    order.forEach((o, pos) => {
      if (o.s !== prev) { rank = pos + 1; prev = o.s; }
      const li = document.createElement('li');
      li.className = `team-color-${o.i % NB_COLORS}`;
      li.innerHTML = `<span class="rank">${rank}</span><span class="team-dot"></span><span class="team-name"></span><span class="team-score">${o.s}</span>`;
      li.querySelector('.team-name').textContent = o.t.name;
      ul.appendChild(li);
    });
    $('jp-ranking').style.display = '';
  }

  // ---------- Question + minuteur ----------
  let current = null;
  let timer = { total: 0, left: 0, running: false, last: 0, raf: null, rang: false };

  function fmt(sec) {
    const s = Math.max(0, Math.ceil(sec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function drawTimer() {
    $('jp-timer-seconds').textContent = fmt(timer.left);
    const frac = timer.total ? timer.left / timer.total : 0;
    const fill = $('jp-timer-fill');
    fill.style.width = `${Math.max(0, frac) * 100}%`;
    fill.classList.toggle('is-low', frac <= 0.2);
    $('jp-timer-seconds').classList.toggle('is-over', timer.left <= 0);
    $('jp-timer-toggle').textContent = timer.running ? 'Pause' : (timer.left <= 0 ? 'Temps écoulé' : 'Démarrer');
    $('jp-timer-toggle').disabled = timer.left <= 0;
  }

  function tick(now) {
    if (!timer.running) return;
    timer.left -= (now - timer.last) / 1000;
    timer.last = now;
    if (timer.left <= 0) {
      timer.left = 0;
      timer.running = false;
      if (!timer.rang) { timer.rang = true; beep(); }
    }
    drawTimer();
    if (timer.running) timer.raf = requestAnimationFrame(tick);
  }

  function startTimer() {
    if (timer.left <= 0) return;
    timer.running = true;
    timer.last = performance.now();
    cancelAnimationFrame(timer.raf);
    timer.raf = requestAnimationFrame(tick);
    drawTimer();
  }
  function pauseTimer() {
    timer.running = false;
    cancelAnimationFrame(timer.raf);
    drawTimer();
  }
  function resetTimer(seconds) {
    pauseTimer();
    timer.total = seconds;
    timer.left = seconds;
    timer.rang = false;
    drawTimer();
  }

  let audioCtx = null;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25, 0.5].forEach(t => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.frequency.value = 660;
        g.gain.setValueAtTime(0.25, audioCtx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.2);
        o.connect(g).connect(audioCtx.destination);
        o.start(audioCtx.currentTime + t);
        o.stop(audioCtx.currentTime + t + 0.2);
      });
    } catch (e) { /* pas de son, tant pis */ }
  }

  $('jp-timer-toggle').addEventListener('click', () => (timer.running ? pauseTimer() : startTimer()));
  $('jp-timer-reset').addEventListener('click', () => { resetTimer(timer.total); startTimer(); });

  function openQuestion(k) {
    current = k;
    const { cat, q } = question(k);
    $('jp-q-meta').textContent = `${cat.name} · ${q.value} points`;
    $('jp-q-text').innerHTML = q.text;
    $('jp-answer').innerHTML = q.answer;
    renderMathIn($('jp-q-text'));
    renderMathIn($('jp-answer'));
    const alreadyPlayed = !!state.used[k];
    $('jp-answer').style.display = alreadyPlayed ? '' : 'none';
    $('jp-reveal-btn').style.display = alreadyPlayed ? 'none' : '';
    renderResults();
    $('jp-question').style.display = '';
    $('jp-question').scrollTop = 0;
    resetTimer(q.time);
    if (!alreadyPlayed) startTimer();
  }

  function renderResults() {
    const res = state.results[current] || {};
    const { q } = question(current);
    const ul = $('jp-result-list');
    ul.innerHTML = '';
    state.teams.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = `team-color-${i % NB_COLORS}`;
      const r = res[i];
      const lose = state.penalty ? `−${q.value}` : '0';
      li.innerHTML = `
        <span class="team-dot"></span><span class="team-name"></span>
        <button class="btn jp-res jp-ok ${r === 'ok' ? 'is-on' : ''}" data-r="ok">✓ Réussi (+${q.value})</button>
        <button class="btn jp-res jp-ko ${r === 'ko' ? 'is-on' : ''}" data-r="ko">✗ Raté (${lose})</button>`;
      li.querySelector('.team-name').textContent = t.name;
      li.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => {
        const byTeam = state.results[current] = state.results[current] || {};
        if (byTeam[i] === b.dataset.r) delete byTeam[i];   // second clic = annuler
        else byTeam[i] = b.dataset.r;
        if (!Object.keys(byTeam).length) delete state.results[current];
        save();
        renderResults();
        renderScores();
      }));
      ul.appendChild(li);
    });
  }

  $('jp-reveal-btn').addEventListener('click', () => {
    pauseTimer();
    $('jp-answer').style.display = '';
    $('jp-reveal-btn').style.display = 'none';
  });

  function closeQuestion() {
    if (!current) return;
    pauseTimer();
    state.used[current] = true;
    save();
    current = null;
    $('jp-question').style.display = 'none';
    renderBoard();
    renderScores();
  }
  $('jp-close-btn').addEventListener('click', closeQuestion);

  document.addEventListener('keydown', e => {
    if ($('jp-question').style.display !== 'none') {
      if (e.key === 'Escape') closeQuestion();
      else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        timer.running ? pauseTimer() : startTimer();
      }
    } else if (e.key === 'Escape' && $('jp-ranking').style.display !== 'none') {
      $('jp-ranking').style.display = 'none';
    }
  });

  // ---------- Démarrage ----------
  $('jp-setup-title').textContent = JEOPARDY.title || 'Jeopardy';
  if (load()) showGame(); else showSetup();
})();
