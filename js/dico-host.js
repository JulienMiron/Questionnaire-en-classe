// Écran de l'animateur du jeu du dictionnaire.
// Tout l'état de la partie vit dans Firebase (games/{code}) : cet écran ne
// fait qu'afficher cet état et le faire avancer. On peut donc rafraîchir la
// page et reprendre la partie sans rien perdre.
(function () {
  const $ = id => document.getElementById(id);
  const S = DICO_SETTINGS;
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const STORAGE_KEY = 'dico-host-room';

  let roomCode = null;
  let gameRef = null;
  let game = null;
  let serverOffset = 0;
  let timerInterval = null;
  let busy = false;          // empêche deux transitions simultanées
  let renderedKey = null;    // évite de reconstruire le DOM inutilement
  let playerOrder = [];      // ordre d'inscription, pour les couleurs

  db.ref('.info/serverTimeOffset').on('value', s => { serverOffset = s.val() || 0; });
  const now = () => Date.now() + serverOffset;

  // ---------- Utilitaires ----------
  function storageGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function players() { return (game && game.players) || {}; }
  function currentRound() {
    if (!game || game.round === undefined || game.round < 0) return null;
    return (game.rounds && game.rounds[game.round]) || null;
  }
  function playerName(id) { return (players()[id] && players()[id].name) || '?'; }
  function colorClass(id) {
    if (!playerOrder.includes(id)) playerOrder.push(id);
    return 'team-color-' + (playerOrder.indexOf(id) % 8);
  }
  function usedConcepts() {
    return Object.values((game && game.rounds) || {}).map(r => r.conceptIndex);
  }
  function nextConceptIndex() {
    const used = usedConcepts();
    for (let i = 0; i < CONCEPTS.length; i++) if (!used.includes(i)) return i;
    return -1;
  }

  // ---------- Création / reprise ----------
  function makeRoomCode() { return String(Math.floor(1000 + Math.random() * 9000)); }

  $('create-game-btn').addEventListener('click', () => {
    const code = makeRoomCode();
    const ref = db.ref('games/' + code);
    ref.set({
      type: 'dictionnaire',
      status: 'lobby',
      round: -1,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => openGame(code))
      .catch(err => { $('setup-error').textContent = 'Impossible de créer la partie : ' + err.message; });
  });

  const saved = storageGet(STORAGE_KEY);
  const forceNew = new URLSearchParams(location.search).has('nouvelle');
  if (saved && !forceNew) {
    db.ref('games/' + saved + '/status').get().then(s => {
      if (s.exists() && s.val() !== 'finished') {
        $('resume-code').textContent = saved;
        $('resume-row').style.display = 'block';
      }
    }).catch(() => {});
  }
  $('resume-btn').addEventListener('click', () => openGame(saved));

  function openGame(code) {
    roomCode = code;
    storageSet(STORAGE_KEY, code);
    gameRef = db.ref('games/' + code);
    $('room-code-display').textContent = code;
    $('setup-screen').style.display = 'none';
    $('game-screen').style.display = 'block';
    gameRef.on('value', snap => {
      game = snap.val();
      if (!game) return;
      render();
      autoAdvance();
    });
  }

  // ---------- Transitions ----------
  function pickHolder() {
    const ps = players();
    const ids = Object.keys(ps);
    const minCount = Math.min(...ids.map(id => ps[id].holderCount || 0));
    const candidates = ids.filter(id => (ps[id].holderCount || 0) === minCount);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function startRound(roundIdx, conceptIndex) {
    const holder = pickHolder();
    const concept = CONCEPTS[conceptIndex];
    const updates = {};
    updates['rounds/' + roundIdx] = {
      conceptIndex,
      word: concept.word,
      holder,
      entries: { [holder]: concept.definition },
      deadline: S.writingTime > 0 ? now() + S.writingTime * 1000 : null
    };
    updates['players/' + holder + '/holderCount'] = (players()[holder].holderCount || 0) + 1;
    updates['round'] = roundIdx;
    updates['status'] = 'writing';
    return gameRef.update(updates);
  }

  function goToVoting() {
    const r = game.round;
    const round = currentRound();
    const entries = round.entries || {};
    const ids = shuffle(Object.keys(entries).filter(id => (entries[id] || '').trim() !== ''));
    const ownIndex = {};
    ids.forEach((id, i) => { ownIndex[id] = i; });
    const updates = {};
    updates['rounds/' + r + '/options'] = ids.map(id => entries[id].trim());
    updates['rounds/' + r + '/owners'] = ids;
    updates['rounds/' + r + '/ownIndex'] = ownIndex;
    updates['rounds/' + r + '/deadline'] = S.votingTime > 0 ? now() + S.votingTime * 1000 : null;
    updates['status'] = 'voting';
    return gameRef.update(updates);
  }

  function reveal() {
    const r = game.round;
    const round = currentRound();
    const owners = round.owners || [];
    const votes = round.votes || {};
    const ps = players();
    const trueIdx = owners.indexOf(round.holder);
    const gained = {};
    const add = (id, pts) => { if (ps[id] && pts) gained[id] = (gained[id] || 0) + pts; };

    let found = 0;
    Object.entries(votes).forEach(([voter, idx]) => {
      if (idx === trueIdx) { add(voter, S.pointsCorrectVote); found++; }
      else if (owners[idx] && owners[idx] !== voter) add(owners[idx], S.pointsPerFooled);
    });
    if (found === 0 && Object.keys(votes).length > 0) add(round.holder, S.pointsHolderIfNobodyFinds);

    const updates = {};
    Object.entries(gained).forEach(([id, pts]) => {
      updates['players/' + id + '/score'] = (ps[id].score || 0) + pts;
    });
    updates['rounds/' + r + '/gained'] = gained;
    updates['rounds/' + r + '/deadline'] = null;
    updates['status'] = 'reveal';
    return gameRef.update(updates);
  }

  function skipConcept() {
    // On remplace le concept de la manche en cours par le suivant, sans
    // compter cette manche comme une « détention » pour le joueur choisi.
    const r = game.round;
    const round = currentRound();
    const next = nextConceptIndex();
    if (next < 0) { alertNote('Il ne reste plus de concept dans la banque.'); return Promise.resolve(); }
    const holder = round.holder;
    const ps = players();
    const updates = {};
    if (ps[holder]) updates['players/' + holder + '/holderCount'] = Math.max(0, (ps[holder].holderCount || 1) - 1);
    updates['rounds/' + r + '/skipped'] = true;
    return gameRef.update(updates).then(() => startRound(r + 1, next));
  }

  function alertNote(msg) { $('status-pill').textContent = msg; }

  function guarded(fn) {
    return function () {
      if (busy) return;
      busy = true;
      Promise.resolve(fn()).catch(err => alertNote('Erreur : ' + err.message)).finally(() => { busy = false; });
    };
  }

  $('start-btn').addEventListener('click', guarded(() => {
    const next = nextConceptIndex();
    return startRound(0, next);
  }));
  $('to-vote-btn').addEventListener('click', guarded(() => game.status === 'writing' && goToVoting()));
  $('skip-btn').addEventListener('click', guarded(() => game.status === 'writing' && skipConcept()));
  $('reveal-btn').addEventListener('click', guarded(() => game.status === 'voting' && reveal()));
  $('next-btn').addEventListener('click', guarded(() => {
    const next = nextConceptIndex();
    if (next < 0) return gameRef.update({ status: 'finished' });
    return startRound(game.round + 1, next);
  }));
  $('end-btn').addEventListener('click', guarded(() => gameRef.update({ status: 'finished' })));

  // Passe automatiquement à l'étape suivante quand le chrono est écoulé, ou
  // quand tous les votes sont entrés.
  function autoAdvance() {
    if (busy || !game) return;
    const round = currentRound();
    if (!round) return;
    if (game.status === 'voting') {
      const voters = Object.keys(players()).filter(id => id !== round.holder);
      const nVotes = Object.keys(round.votes || {}).length;
      if (voters.length > 0 && nVotes >= voters.length) guarded(reveal)();
    }
  }

  function tick() {
    const round = currentRound();
    const track = $('timer-track');
    const secs = $('timer-seconds');
    if (!round || !round.deadline || !['writing', 'voting'].includes(game.status)) {
      track.style.visibility = 'hidden';
      secs.textContent = '';
      return;
    }
    const total = (game.status === 'writing' ? S.writingTime : S.votingTime) * 1000;
    const remaining = Math.max(0, round.deadline - now());
    track.style.visibility = 'visible';
    secs.textContent = Math.ceil(remaining / 1000) + ' s';
    $('timer-fill').style.width = (remaining / total) * 100 + '%';
    $('timer-fill').classList.toggle('is-low', remaining <= total * 0.25);
    if (remaining <= 0 && !busy) {
      if (game.status === 'writing') guarded(goToVoting)();
      else if (game.status === 'voting') guarded(reveal)();
    }
  }
  timerInterval = setInterval(() => { if (game) tick(); }, 250);

  // ---------- Affichage ----------
  function renderScoreboard(listEl, withAdjust) {
    const list = Object.entries(players()).map(([id, p]) => ({ id, ...p }));
    list.sort((a, b) => (b.score || 0) - (a.score || 0) || (a.joinedAt || 0) - (b.joinedAt || 0));
    listEl.innerHTML = '';
    list.forEach((p, i) => {
      const li = el('li', colorClass(p.id));
      li.appendChild(el('span', 'rank', String(i + 1)));
      li.appendChild(el('span', 'team-dot'));
      li.appendChild(el('span', 'team-name', p.name));
      if (withAdjust) {
        const adj = el('span', 'dico-adjust');
        [-1, +1].forEach(d => {
          const b = el('button', 'btn jp-small', d > 0 ? '+1' : '−1');
          b.title = 'Ajustement manuel';
          b.addEventListener('click', () => {
            gameRef.child('players/' + p.id + '/score').transaction(s => (s || 0) + d);
          });
          adj.appendChild(b);
        });
        li.appendChild(adj);
      }
      li.appendChild(el('span', 'team-score', String(p.score || 0)));
      listEl.appendChild(li);
    });
  }

  const STATUS_LABEL = {
    lobby: "Salle d'attente",
    writing: 'Écriture des définitions',
    voting: 'Vote',
    reveal: 'Révélation'
  };

  function render() {
    const status = game.status;
    if (status === 'finished') {
      $('game-screen').style.display = 'none';
      $('finished-screen').style.display = 'block';
      renderScoreboard($('final-scoreboard'), false);
      return;
    }
    $('game-screen').style.display = 'block';
    $('finished-screen').style.display = 'none';
    $('status-pill').textContent = STATUS_LABEL[status] || '';
    renderScoreboard($('scoreboard'), true);

    const nPlayers = Object.keys(players()).length;
    $('lobby-panel').style.display = status === 'lobby' ? 'block' : 'none';
    $('round-panel').style.display = status === 'lobby' ? 'none' : 'block';

    if (status === 'lobby') {
      $('player-count').textContent = nPlayers;
      const ul = $('lobby-list');
      ul.innerHTML = '';
      Object.entries(players()).forEach(([id, p]) => {
        const li = el('li', colorClass(id));
        li.appendChild(el('span', 'team-dot'));
        li.appendChild(el('span', 'team-name', p.name));
        ul.appendChild(li);
      });
      $('start-btn').disabled = nPlayers < 2 || CONCEPTS.length === 0;
      return;
    }

    const round = currentRound();
    if (!round) return;
    const r = game.round;
    const key = status + ':' + r;
    const fresh = key !== renderedKey;
    renderedKey = key;

    $('round-progress').textContent = `Manche ${r + 1 - countSkippedBefore(r)} · concept ${usedConcepts().length} / ${CONCEPTS.length}`;
    if (fresh) {
      $('round-word').textContent = round.word;
      renderMathIn($('round-word'));
    }
    $('writing-block').style.display = status === 'writing' ? 'block' : 'none';
    $('voting-block').style.display = status === 'voting' ? 'block' : 'none';
    $('reveal-block').style.display = status === 'reveal' ? 'block' : 'none';

    const others = Object.keys(players()).filter(id => id !== round.holder);

    if (status === 'writing') {
      const entries = round.entries || {};
      const written = others.filter(id => (entries[id] || '').trim() !== '').length;
      $('written-count').textContent = written;
      $('written-total').textContent = others.length;
      $('to-vote-btn').classList.toggle('is-ready', others.length > 0 && written >= others.length);
      $('skip-btn').disabled = nextConceptIndex() < 0;
    }

    if (status === 'voting') {
      if (fresh) {
        const ol = $('voting-options');
        ol.innerHTML = '';
        (round.options || []).forEach((text, i) => {
          const li = el('li', 'dico-option');
          li.appendChild(el('span', 'dico-letter', LETTERS[i]));
          li.appendChild(el('span', 'dico-text', text));
          ol.appendChild(li);
        });
        renderMathIn(ol);
      }
      $('voted-count').textContent = Object.keys(round.votes || {}).length;
      $('voted-total').textContent = others.length;
    }

    if (status === 'reveal') {
      const ol = $('reveal-options');
      ol.innerHTML = '';
      const owners = round.owners || [];
      const votes = round.votes || {};
      const gained = round.gained || {};
      (round.options || []).forEach((text, i) => {
        const isTrue = owners[i] === round.holder;
        const li = el('li', 'dico-option' + (isTrue ? ' is-true' : ''));
        li.appendChild(el('span', 'dico-letter', LETTERS[i]));
        const body = el('div', 'dico-body');
        body.appendChild(el('span', 'dico-text', text));
        const meta = el('div', 'dico-meta');
        meta.appendChild(el('span', 'dico-author',
          isTrue ? `✓ Vraie définition (remise à ${playerName(owners[i])})` : `Écrite par ${playerName(owners[i])}`));
        const voters = Object.keys(votes).filter(v => votes[v] === i);
        const vs = el('span', 'dico-voters');
        vs.appendChild(el('span', 'dico-vote-count', voters.length + (voters.length > 1 ? ' votes' : ' vote')));
        voters.forEach(v => {
          const chip = el('span', 'dico-voter ' + colorClass(v));
          chip.appendChild(el('span', 'team-dot'));
          chip.appendChild(document.createTextNode(playerName(v)));
          vs.appendChild(chip);
        });
        meta.appendChild(vs);
        if (!isTrue && gained[owners[i]] && voters.length) {
          meta.appendChild(el('span', 'dico-gain', '+' + voters.length * S.pointsPerFooled));
        }
        body.appendChild(meta);
        li.appendChild(body);
        ol.appendChild(li);
      });
      renderMathIn(ol);

      const concept = CONCEPTS[round.conceptIndex];
      const ex = $('reveal-explanation');
      if (concept && concept.explanation) {
        ex.textContent = concept.explanation;
        ex.style.display = 'block';
        renderMathIn(ex);
      } else ex.style.display = 'none';

      $('next-btn').textContent = nextConceptIndex() < 0 ? 'Voir les résultats finaux' : 'Manche suivante';
    }
    tick();
  }

  function countSkippedBefore(r) {
    let n = 0;
    for (let i = 0; i < r; i++) if (game.rounds && game.rounds[i] && game.rounds[i].skipped) n++;
    return n;
  }
})();
