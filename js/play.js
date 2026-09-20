(function () {
  const joinScreen = document.getElementById('join-screen');
  const waitingScreen = document.getElementById('waiting-screen');
  const questionScreen = document.getElementById('question-screen');
  const revealScreen = document.getElementById('reveal-screen');
  const finishedScreen = document.getElementById('team-finished-screen');

  const joinForm = document.getElementById('join-form');
  const roomCodeInput = document.getElementById('room-code-input');
  const teamNameInput = document.getElementById('team-name-input');
  const joinError = document.getElementById('join-error');

  const waitingTeamName = document.getElementById('waiting-team-name');

  const myScorePill = document.getElementById('my-score-pill');
  const myProgress = document.getElementById('my-progress');
  const teamQuestionText = document.getElementById('team-question-text');
  const teamChoicesGrid = document.getElementById('team-choices-grid');
  const waitingForOthers = document.getElementById('waiting-for-others');

  const teamRevealText = document.getElementById('team-reveal-text');
  const teamRevealGrid = document.getElementById('team-reveal-grid');
  const revealVerdict = document.getElementById('reveal-verdict');

  const teamFinalScoreboard = document.getElementById('team-final-scoreboard');

  let roomCode = null;
  let teamId = null;
  let gameRef = null;
  let myScore = 0;
  let hasAnsweredCurrent = false;
  let lastChoiceIndex = null;

  function showScreen(el) {
    [joinScreen, waitingScreen, questionScreen, revealScreen, finishedScreen].forEach(s => s.style.display = 'none');
    el.style.display = 'block';
  }

  joinForm.addEventListener('submit', e => {
    e.preventDefault();
    joinError.textContent = '';
    const code = roomCodeInput.value.trim();
    const name = teamNameInput.value.trim();
    if (!/^\d{4}$/.test(code)) {
      joinError.textContent = 'Le code doit contenir 4 chiffres.';
      return;
    }
    if (!name) {
      joinError.textContent = "Donne un nom à ton équipe.";
      return;
    }
    db.ref('games/' + code).get().then(snap => {
      if (!snap.exists()) {
        joinError.textContent = "Cette partie n'existe pas. Vérifie le code.";
        return;
      }
      const game = snap.val();
      if (game.status !== 'lobby') {
        joinError.textContent = "Cette partie a déjà commencé.";
        return;
      }
      roomCode = code;
      gameRef = db.ref('games/' + roomCode);
      const newTeamRef = gameRef.child('teams').push();
      teamId = newTeamRef.key;
      newTeamRef.set({ name, score: 0 }).then(() => {
        sessionStorage.setItem('quiz-room', roomCode);
        sessionStorage.setItem('quiz-team-id', teamId);
        waitingTeamName.textContent = name;
        showScreen(waitingScreen);
        attachListeners();
      });
    }).catch(err => {
      joinError.textContent = 'Erreur de connexion : ' + err.message;
    });
  });

  function attachListeners() {
    gameRef.child('teams/' + teamId + '/score').on('value', snap => {
      myScore = snap.val() || 0;
      myScorePill.textContent = myScore + (myScore === 1 ? ' point' : ' points');
    });

    gameRef.child('status').on('value', snap => {
      const status = snap.val();
      if (status === 'lobby') {
        showScreen(waitingScreen);
      } else if (status === 'question') {
        hasAnsweredCurrent = false;
        lastChoiceIndex = null;
        waitingForOthers.style.display = 'none';
        showScreen(questionScreen);
      } else if (status === 'reveal') {
        showScreen(revealScreen);
      } else if (status === 'finished') {
        renderFinalScoreboard();
        showScreen(finishedScreen);
      }
    });

    gameRef.child('currentQuestion').on('value', snap => {
      const idx = snap.val();
      if (idx === null || idx < 0) return;
      gameRef.child('questions/' + idx).get().then(qSnap => {
        const q = qSnap.val();
        if (!q) return;
        myProgressUpdate(idx);
        renderQuestion(q, idx);
        renderRevealShell(q);
      });
    });

    gameRef.child('revealCorrectIndex').on('value', snap => {
      const correctIndex = snap.val();
      if (correctIndex === null || correctIndex === undefined) return;
      Array.from(teamRevealGrid.children).forEach(div => {
        const i = Number(div.dataset.index);
        if (i === correctIndex) div.classList.add('is-correct');
        else if (i === lastChoiceIndex) div.classList.add('is-wrong');
      });
      if (lastChoiceIndex === correctIndex) {
        revealVerdict.textContent = 'Bonne réponse !';
        revealVerdict.style.color = 'var(--teal)';
      } else if (lastChoiceIndex === null) {
        revealVerdict.textContent = "Vous n'avez pas répondu à temps.";
        revealVerdict.style.color = 'var(--chalk-dim)';
      } else {
        revealVerdict.textContent = 'Mauvaise réponse.';
        revealVerdict.style.color = 'var(--coral)';
      }
    });
  }

  function myProgressUpdate(idx) {
    db.ref('games/' + roomCode + '/questions').get().then(snap => {
      const total = (snap.val() || []).length;
      myProgress.textContent = `Question ${idx + 1} / ${total}`;
    });
  }

  function renderQuestion(q, idx) {
    teamQuestionText.textContent = q.text;
    teamChoicesGrid.innerHTML = '';
    q.choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice;
      btn.dataset.index = i;
      btn.addEventListener('click', () => submitAnswer(idx, i, btn));
      teamChoicesGrid.appendChild(btn);
    });
  }

  function renderRevealShell(q) {
    teamRevealText.textContent = q.text;
    teamRevealGrid.innerHTML = '';
    revealVerdict.textContent = '';
    q.choices.forEach((choice, i) => {
      const div = document.createElement('div');
      div.className = 'btn choice-btn';
      if (i === lastChoiceIndex) div.classList.add('is-picked');
      div.textContent = choice;
      div.dataset.index = i;
      teamRevealGrid.appendChild(div);
    });
  }

  function submitAnswer(idx, choiceIndex, clickedBtn) {
    if (hasAnsweredCurrent) return;
    hasAnsweredCurrent = true;
    lastChoiceIndex = choiceIndex;
    Array.from(teamChoicesGrid.children).forEach(btn => {
      btn.disabled = true;
      if (btn === clickedBtn) btn.classList.add('is-picked');
    });
    waitingForOthers.style.display = 'block';
    gameRef.child('answers/' + idx + '/' + teamId).set({
      choiceIndex,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  }

  function renderFinalScoreboard() {
    gameRef.child('teams').get().then(snap => {
      const teams = snap.val() || {};
      const list = Object.values(teams).sort((a, b) => b.score - a.score);
      teamFinalScoreboard.innerHTML = '';
      list.forEach((t, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="rank">${i + 1}</span><span class="team-dot"></span><span class="team-name">${t.name}</span><span class="team-score">${t.score}</span>`;
        teamFinalScoreboard.appendChild(li);
      });
    });
  }
})();
