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
  // Le plan de la partie est fixé au départ : une manche par joueur, chaque
  // joueur détient la vraie définition exactement une fois.
  function plan() { return (game && game.plan) || { holders: [], concepts: [] }; }
  function totalRounds() { return plan().holders.length; }
  // Concept de remplacement (pour « Changer de concept ») : un concept qui ne
  // figure pas déjà dans le plan.
  function spareConceptIndex() {
    const inPlan = plan().concepts;
    const spare = [];
    for (let i = 0; i < CONCEPTS.length; i++) if (!inPlan.includes(i)) spare.push(i);
    return spare.length ? spare[Math.floor(Math.random() * spare.length)] : -1;
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
  // Au départ : autant de manches que de joueurs (au plus le nombre de
  // concepts), un ordre aléatoire des détenteurs et des concepts tirés au
  // hasard dans la banque.
  function startGame() {
    const ids = shuffle(Object.keys(players()));
    const n = Math.min(ids.length, CONCEPTS.length);
    const concepts = shuffle(CONCEPTS.map((_, i) => i)).slice(0, n);
    return gameRef.update({ plan: { holders: ids.slice(0, n), concepts } })
      .then(() => { game.plan = { holders: ids.slice(0, n), concepts }; return startRound(0); });
  }

  function roundData(roundIdx, conceptIndex, holder) {
    const concept = CONCEPTS[conceptIndex];
    return {
      conceptIndex,
      word: concept.word,
      holder,
      entries: { [holder]: concept.definition },
      deadline: S.writingTime > 0 ? now() + S.writingTime * 1000 : null
    };
  }

  function startRound(roundIdx) {
    const holder = plan().holders[roundIdx];
    const conceptIndex = plan().concepts[roundIdx];
    const updates = {};
    updates['rounds/' + roundIdx] = roundData(roundIdx, conceptIndex, holder);
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
    // Remplace le concept de la manche en cours par un concept inutilisé. Le
    // détenteur reste le même : chacun garde exactement une manche.
    const r = game.round;
    const next = spareConceptIndex();
    if (next < 0) { alertNote('Il ne reste plus de concept de rechange dans la banque.'); return Promise.resolve(); }
    const updates = {};
    updates['plan/concepts/' + r] = next;
    updates['rounds/' + r] = roundData(r, next, currentRound().holder);
    return gameRef.update(updates);
  }

  function alertNote(msg) { $('status-pill').textContent = msg; }

  function guarded(fn) {
    return function () {
      if (busy) return;
      busy = true;
      Promise.resolve(fn()).catch(err => alertNote('Erreur : ' + err.message)).finally(() => { busy = false; });
    };
  }

  $('start-btn').addEventListener('click', guarded(() => game.status === 'lobby' && startGame()));
  $('to-vote-btn').addEventListener('click', guarded(() => game.status === 'writing' && goToVoting()));
  $('skip-btn').addEventListener('click', guarded(() => game.status === 'writing' && skipConcept()));
  $('reveal-btn').addEventListener('click', guarded(() => game.status === 'voting' && reveal()));
  $('next-btn').addEventListener('click', guarded(() => {
    if (game.round + 1 >= totalRounds()) return gameRef.update({ status: 'finished' });
    return startRound(game.round + 1);
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
      const info = $('lobby-rounds');
      if (nPlayers < 2) info.textContent = '';
      else if (nPlayers <= CONCEPTS.length) {
        info.textContent = `${nPlayers} joueurs : ${nPlayers} manches, ${nPlayers} concepts tirés au hasard parmi ${CONCEPTS.length}. Chaque joueur recevra la vraie définition exactement une fois.`;
        info.classList.remove('is-warning');
      } else {
        info.textContent = `${nPlayers} joueurs, mais seulement ${CONCEPTS.length} concepts dans la banque : ${nPlayers - CONCEPTS.length} joueur(s) ne recevront jamais la vraie définition. Ajoute des concepts dans js/concepts.js.`;
        info.classList.add('is-warning');
      }
      return;
    }

    const round = currentRound();
    if (!round) return;
    const r = game.round;
    const key = status + ':' + r + ':' + round.conceptIndex;
    const fresh = key !== renderedKey;
    renderedKey = key;

    $('round-progress').textContent = `Manche ${r + 1} / ${totalRounds()}`;
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
      $('skip-btn').disabled = spareConceptIndex() < 0;
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

      $('next-btn').textContent = game.round + 1 >= totalRounds() ? 'Voir les résultats finaux' : 'Manche suivante';
    }
    tick();
  }

})();
