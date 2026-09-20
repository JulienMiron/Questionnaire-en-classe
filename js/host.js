(function () {
  const setupScreen = document.getElementById('setup-screen');
  const gameScreen = document.getElementById('game-screen');
  const finishedScreen = document.getElementById('finished-screen');

  const createGameBtn = document.getElementById('create-game-btn');
  const setupError = document.getElementById('setup-error');

  const roomCodeDisplay = document.getElementById('room-code-display');
  const statusPill = document.getElementById('status-pill');

  const lobbyPanel = document.getElementById('lobby-panel');
  const lobbyTeamList = document.getElementById('lobby-team-list');
  const teamCountEl = document.getElementById('team-count');
  const teamCount2El = document.getElementById('team-count-2');
  const startGameBtn = document.getElementById('start-game-btn');

  const questionPanel = document.getElementById('question-panel');
  const questionProgress = document.getElementById('question-progress');
  const hostQuestionText = document.getElementById('host-question-text');
  const hostChoicesGrid = document.getElementById('host-choices-grid');
  const answeredCountEl = document.getElementById('answered-count');
  const revealBtn = document.getElementById('reveal-btn');

  const revealPanel = document.getElementById('reveal-panel');
  const revealQuestionText = document.getElementById('reveal-question-text');
  const nextBtn = document.getElementById('next-btn');

  const scoreboardList = document.getElementById('scoreboard-list');
  const finalScoreboard = document.getElementById('final-scoreboard');

  let roomCode = null;
  let gameRef = null;
  let teams = {}; // teamId -> {name, score}
  let teamOrder = []; // preserves join order for consistent colours

  function makeRoomCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  function publicQuestions() {
    return QUESTIONS.map(q => ({ text: q.text, choices: q.choices }));
  }

  function renderTeamList(el, sortByScore) {
    const list = Object.entries(teams).map(([id, t]) => ({ id, ...t }));
    if (sortByScore) list.sort((a, b) => b.score - a.score);
    el.innerHTML = '';
    list.forEach((t, i) => {
      const colorIndex = teamOrder.indexOf(t.id) % 6;
      const li = document.createElement('li');
      li.className = `team-color-${colorIndex}`;
      li.innerHTML = `
        ${sortByScore ? `<span class="rank">${i + 1}</span>` : ''}
        <span class="team-dot"></span>
        <span class="team-name">${escapeHtml(t.name)}</span>
        <span class="team-score">${t.score}</span>
      `;
      el.appendChild(li);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function updateTeamCounts() {
    const n = Object.keys(teams).length;
    teamCountEl.textContent = n;
    teamCount2El.textContent = n;
    startGameBtn.disabled = n === 0;
  }

  createGameBtn.addEventListener('click', () => {
    roomCode = makeRoomCode();
    gameRef = db.ref('games/' + roomCode);
    gameRef.set({
      status: 'lobby',
      currentQuestion: -1,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      questions: publicQuestions(),
      teams: {}
    }).then(() => {
      roomCodeDisplay.textContent = roomCode;
      setupScreen.style.display = 'none';
      gameScreen.style.display = 'block';
      attachListeners();
    }).catch(err => {
      setupError.textContent = "Impossible de créer la partie : " + err.message;
    });
  });

  function attachListeners() {
    gameRef.child('teams').on('value', snap => {
      teams = snap.val() || {};
      Object.keys(teams).forEach(id => {
        if (!teamOrder.includes(id)) teamOrder.push(id);
      });
      updateTeamCounts();
      renderTeamList(lobbyTeamList, false);
      renderTeamList(scoreboardList, true);
      renderTeamList(finalScoreboard, true);
    });

    gameRef.child('status').on('value', snap => {
      const status = snap.val();
      if (status === 'lobby') {
        statusPill.textContent = "Salle d'attente";
        lobbyPanel.style.display = 'block';
        questionPanel.style.display = 'none';
        revealPanel.style.display = 'none';
      } else if (status === 'question') {
        statusPill.textContent = 'Question en cours';
        lobbyPanel.style.display = 'none';
        questionPanel.style.display = 'block';
        revealPanel.style.display = 'none';
      } else if (status === 'reveal') {
        statusPill.textContent = 'Réponse révélée';
        lobbyPanel.style.display = 'none';
        questionPanel.style.display = 'none';
        revealPanel.style.display = 'block';
      } else if (status === 'finished') {
        gameScreen.style.display = 'none';
        finishedScreen.style.display = 'block';
      }
    });

    gameRef.child('currentQuestion').on('value', snap => {
      const idx = snap.val();
      if (idx === null || idx < 0) return;
      const q = QUESTIONS[idx];
      if (!q) return;
      questionProgress.textContent = `Question ${idx + 1} / ${QUESTIONS.length}`;
      hostQuestionText.textContent = q.text;
      revealQuestionText.textContent = q.text;
      hostChoicesGrid.innerHTML = '';
      q.choices.forEach((choice, i) => {
        const div = document.createElement('div');
        div.className = 'btn choice-btn';
        div.textContent = choice;
        div.dataset.index = i;
        hostChoicesGrid.appendChild(div);
      });
      answeredCountEl.textContent = '0';

      gameRef.child('answers/' + idx).off();
      gameRef.child('answers/' + idx).on('value', ansSnap => {
        const answers = ansSnap.val() || {};
        answeredCountEl.textContent = Object.keys(answers).length;
      });
    });
  }

  startGameBtn.addEventListener('click', () => {
    gameRef.update({ status: 'question', currentQuestion: 0 });
  });

  revealBtn.addEventListener('click', () => {
    const idxRef = gameRef.child('currentQuestion');
    idxRef.get().then(snap => {
      const idx = snap.val();
      const q = QUESTIONS[idx];
      gameRef.child('answers/' + idx).get().then(ansSnap => {
        const answers = ansSnap.val() || {};
        const updates = {};
        Object.entries(answers).forEach(([teamId, ans]) => {
          if (ans.choiceIndex === q.correctIndex) {
            const current = (teams[teamId] && teams[teamId].score) || 0;
            updates['teams/' + teamId + '/score'] = current + q.points;
          }
        });
        // Mark choices as correct/wrong visually for the host
        Array.from(hostChoicesGrid.children).forEach(div => {
          const i = Number(div.dataset.index);
          if (i === q.correctIndex) div.classList.add('is-correct');
        });
        updates['status'] = 'reveal';
        updates['revealCorrectIndex'] = q.correctIndex;
        gameRef.update(updates);
      });
    });
  });

  nextBtn.addEventListener('click', () => {
    gameRef.child('currentQuestion').get().then(snap => {
      const idx = snap.val();
      const nextIdx = idx + 1;
      if (nextIdx < QUESTIONS.length) {
        gameRef.update({ status: 'question', currentQuestion: nextIdx, revealCorrectIndex: null });
      } else {
        gameRef.update({ status: 'finished' });
      }
    });
  });
})();
