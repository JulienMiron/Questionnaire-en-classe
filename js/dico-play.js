// Écran d'un joueur du jeu du dictionnaire.
(function () {
  const $ = id => document.getElementById(id);
  const S = DICO_SETTINGS;
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const STORAGE_KEY = 'dico-player';

  let gameRef = null;
  let myId = null;
  let game = null;
  let serverOffset = 0;
  let renderedKey = null;

  db.ref('.info/serverTimeOffset').on('value', s => { serverOffset = s.val() || 0; });
  const now = () => Date.now() + serverOffset;

  function storageGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function storageSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  const pts = n => n + (Math.abs(n) > 1 ? ' points' : ' point');

  // ---------- Inscription ----------
  $('code-input').value = new URLSearchParams(location.search).get('code') || '';
  $('w-text').maxLength = S.maxLength;

  $('join-form').addEventListener('submit', e => {
    e.preventDefault();
    const err = $('join-error');
    err.textContent = '';
    const code = $('code-input').value.trim();
    const name = $('name-input').value.trim().replace(/\s+/g, ' ');
    if (!/^\d{4}$/.test(code)) { err.textContent = 'Le code doit contenir 4 chiffres.'; return; }
    if (!name) { err.textContent = 'Écris ton nom.'; return; }

    db.ref('games/' + code).get().then(snap => {
      const g = snap.val();
      if (!g || g.type !== 'dictionnaire') { err.textContent = "Cette partie n'existe pas. Vérifie le code."; return; }
      if (g.status === 'finished') { err.textContent = 'Cette partie est terminée.'; return; }
      const ps = g.players || {};
      // Même nom (sans tenir compte des majuscules) : on reprend la place du
      // joueur, par exemple après avoir fermé la fenêtre par erreur.
      const existing = Object.keys(ps).find(id => ps[id].name.toLowerCase() === name.toLowerCase());
      if (existing) return attach(code, existing);
      const ref = db.ref('games/' + code + '/players').push();
      return ref.set({
        name, score: 0, holderCount: 0,
        joinedAt: firebase.database.ServerValue.TIMESTAMP
      }).then(() => attach(code, ref.key));
    }).catch(e2 => { err.textContent = 'Erreur de connexion : ' + e2.message; });
  });

  // Reprise automatique après un rafraîchissement de la page.
  const saved = storageGet(STORAGE_KEY);
  if (saved && saved.code && saved.id) {
    db.ref('games/' + saved.code).get().then(snap => {
      const g = snap.val();
      if (g && g.status !== 'finished' && g.players && g.players[saved.id]) attach(saved.code, saved.id);
    }).catch(() => {});
  }

  function attach(code, id) {
    if (gameRef) return;
    myId = id;
    storageSet(STORAGE_KEY, { code, id });
    gameRef = db.ref('games/' + code);
    $('join-screen').style.display = 'none';
    $('play-screen').style.display = 'block';
    gameRef.on('value', snap => {
      game = snap.val();
      if (game) render();
    });
    setInterval(tick, 250);
  }

  // ---------- Actions ----------
  $('w-send').addEventListener('click', () => {
    const text = $('w-text').value.trim();
    if (!text) { $('w-sent').textContent = 'Ta définition est vide.'; return; }
    if (game.status !== 'writing') return;
    gameRef.child('rounds/' + game.round + '/entries/' + myId).set(text).then(() => {
      $('w-sent').textContent = 'Envoyée ✓';
      $('w-send').textContent = 'Mettre à jour';
    });
  });

  $('w-text').addEventListener('input', () => {
    const round = currentRound();
    const sent = round && round.entries && round.entries[myId];
    $('w-sent').textContent = sent && sent !== $('w-text').value.trim() ? 'Modification non envoyée' : (sent ? 'Envoyée ✓' : '');
  });

  function vote(idx) {
    if (game.status !== 'voting') return;
    const ref = gameRef.child('rounds/' + game.round + '/votes/' + myId);
    // La transaction empêche de changer un vote déjà enregistré.
    ref.transaction(cur => (cur === null ? idx : undefined));
  }

  // ---------- Affichage ----------
  function currentRound() {
    if (!game || game.round === undefined || game.round < 0) return null;
    return (game.rounds && game.rounds[game.round]) || null;
  }

  function show(viewId) {
    ['lobby-view', 'writing-view', 'voting-view', 'reveal-view', 'finished-view']
      .forEach(v => { $(v).style.display = v === viewId ? 'block' : 'none'; });
  }

  function tick() {
    const round = currentRound();
    const track = $('timer-track');
    if (!game || !round || !round.deadline || !['writing', 'voting'].includes(game.status)) {
      track.style.visibility = 'hidden';
      return;
    }
    const total = (game.status === 'writing' ? S.writingTime : S.votingTime) * 1000;
    const remaining = Math.max(0, round.deadline - now());
    track.style.visibility = 'visible';
    $('timer-fill').style.width = (remaining / total) * 100 + '%';
    $('timer-fill').classList.toggle('is-low', remaining <= total * 0.25);
  }

  function render() {
    const me = (game.players || {})[myId];
    if (!me) {
      // Le joueur a été retiré : on revient à l'inscription.
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      location.reload();
      return;
    }
    $('me-pill').textContent = me.name;
    $('score-pill').textContent = pts(me.score || 0);

    const status = game.status;
    if (status === 'lobby') { renderedKey = 'lobby'; show('lobby-view'); return; }
    if (status === 'finished') { renderFinal(); show('finished-view'); return; }

    const round = currentRound();
    if (!round) return;
    const isHolder = round.holder === myId;
    const key = status + ':' + game.round + ':' + isHolder;
    const fresh = key !== renderedKey;
    renderedKey = key;

    if (status === 'writing') { if (fresh) renderWriting(round, isHolder); show('writing-view'); }
    else if (status === 'voting') { renderVoting(round, isHolder, fresh); show('voting-view'); }
    else if (status === 'reveal') { if (fresh) renderReveal(round, isHolder); show('reveal-view'); }
    tick();
  }

  function setWord(id, word) { $(id).textContent = word; renderMathIn($(id)); }

  function renderWriting(round, isHolder) {
    setWord('w-word', round.word);
    const text = $('w-text');
    const preview = $('w-preview');
    const mine = (round.entries || {})[myId] || '';
    if (isHolder) {
      $('w-role').innerHTML = '';
      $('w-role').appendChild(el('strong', null, 'Le hasard t\'a remis la vraie définition.'));
      $('w-role').appendChild(document.createTextNode(' Tu ne peux pas la modifier. Garde le secret : les autres doivent croire que c\'est une invention !'));
      $('w-role').className = 'dico-role is-holder';
      text.style.display = 'none';
      preview.style.display = 'block';
      preview.textContent = mine;
      renderMathIn(preview);
      $('w-send').style.display = 'none';
      $('w-sent').textContent = '';
      $('w-help').style.display = 'none';
    } else {
      $('w-role').textContent = 'Invente une fausse définition qui a l\'air vraie. Chaque vote qu\'elle attire te rapporte ' + pts(S.pointsPerFooled) + '.';
      $('w-role').className = 'dico-role';
      text.style.display = 'block';
      text.value = mine;
      text.readOnly = false;
      preview.style.display = 'none';
      $('w-send').style.display = '';
      $('w-send').textContent = mine ? 'Mettre à jour' : 'Envoyer ma définition';
      $('w-sent').textContent = mine ? 'Envoyée ✓' : '';
      $('w-help').style.display = 'block';
    }
  }

  function renderVoting(round, isHolder, fresh) {
    if (fresh) setWord('v-word', round.word);
    const myVote = (round.votes || {})[myId];
    const ownIdx = (round.ownIndex || {})[myId];
    const role = $('v-role');
    if (isHolder) {
      role.textContent = 'Tu détiens la vraie définition : tu ne votes pas à cette manche.';
      role.className = 'dico-role is-holder';
    } else if (myVote !== undefined && myVote !== null) {
      role.textContent = 'Vote enregistré ✓ En attente des autres joueurs…';
      role.className = 'dico-role is-done';
    } else {
      role.textContent = 'Quelle est la vraie définition ? Gagne ' + pts(S.pointsCorrectVote) + ' si tu la trouves.';
      role.className = 'dico-role';
    }

    const box = $('v-options');
    if (fresh) {
      box.innerHTML = '';
      (round.options || []).forEach((text, i) => {
        const b = el('button', 'choice-btn dico-vote-btn');
        b.dataset.index = i;
        b.appendChild(el('span', 'dico-letter', LETTERS[i]));
        b.appendChild(el('span', 'dico-text', text));
        if (i === ownIdx && !isHolder) b.appendChild(el('span', 'dico-own', 'ta définition'));
        b.addEventListener('click', () => vote(i));
        box.appendChild(b);
      });
      renderMathIn(box);
    }
    Array.from(box.children).forEach(b => {
      const i = Number(b.dataset.index);
      const voted = myVote !== undefined && myVote !== null;
      b.disabled = isHolder || voted || i === ownIdx;
      b.classList.toggle('is-picked', voted && i === myVote);
      b.classList.toggle('is-correct', isHolder && i === ownIdx);
    });
  }

  function renderReveal(round, isHolder) {
    setWord('r-word', round.word);
    const owners = round.owners || [];
    const trueIdx = owners.indexOf(round.holder);
    $('r-true').textContent = (round.options || [])[trueIdx] || '';
    renderMathIn($('r-true'));

    const votes = round.votes || {};
    const myVote = votes[myId];
    const ownIdx = (round.ownIndex || {})[myId];
    const gained = (round.gained || {})[myId] || 0;
    const v = $('r-verdict');
    v.innerHTML = '';
    const lines = [];
    if (isHolder) {
      const found = Object.values(votes).filter(x => x === trueIdx).length;
      lines.push(found === 0 ? 'Tu détenais la vraie définition, et personne ne l\'a trouvée !' : `Tu détenais la vraie définition. ${found} joueur${found > 1 ? 's l\'ont' : ' l\'a'} trouvée.`);
    } else {
      if (myVote === trueIdx) lines.push('Bravo, tu as trouvé la vraie définition !');
      else if (myVote === undefined || myVote === null) lines.push('Tu n\'as pas voté.');
      else lines.push(`Raté : tu as voté pour la définition ${LETTERS[myVote]}.`);
      if (ownIdx !== undefined && ownIdx !== null) {
        const fooled = Object.entries(votes).filter(([voter, x]) => x === ownIdx && voter !== myId).length;
        lines.push(fooled === 0 ? 'Ta définition n\'a attiré aucun vote.' : `Ta définition a attiré ${fooled} vote${fooled > 1 ? 's' : ''}.`);
      } else lines.push('Tu n\'avais pas envoyé de définition.');
    }
    lines.forEach(t => v.appendChild(el('span', null, t)));
    v.appendChild(el('strong', 'dico-round-gain', gained > 0 ? '+' + pts(gained) : 'Aucun point à cette manche'));
  }

  function renderFinal() {
    const list = Object.entries(game.players || {}).map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
    const ul = $('final-scoreboard');
    ul.innerHTML = '';
    list.forEach((p, i) => {
      const li = el('li', p.id === myId ? 'is-me' : '');
      li.appendChild(el('span', 'rank', String(i + 1)));
      li.appendChild(el('span', 'team-name', p.name));
      li.appendChild(el('span', 'team-score', String(p.score || 0)));
      ul.appendChild(li);
    });
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }
})();
