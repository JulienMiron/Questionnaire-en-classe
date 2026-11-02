// Codes de partie communs à tous les jeux qui utilisent Firebase.
// Chaque partie vit dans games/{code} et porte un champ "type" qui indique
// à quel jeu elle appartient. Un même code ne peut donc pas servir à deux
// parties en même temps, peu importe le jeu.
const GAME_TYPES = {
  questionnaire: { label: 'Questionnaire en classe', playerPage: 'play.html' },
  dictionnaire: { label: 'Jeu du dictionnaire', playerPage: 'dictionnaire-joueur.html' }
};

// Une partie plus vieille que ce délai est considérée comme abandonnée : son
// code peut être réutilisé.
const ROOM_MAX_AGE_MS = 12 * 60 * 60 * 1000;

// Les parties créées avant l'ajout du champ "type" sont des questionnaires.
function gameTypeOf(game) {
  return (game && game.type) || 'questionnaire';
}

// Réserve un code à 4 chiffres libre et y écrit la partie.
// Retourne une promesse qui donne le code.
function createRoom(type, data, attempt) {
  attempt = attempt || 0;
  if (attempt >= 30) return Promise.reject(new Error('aucun code libre trouvé, réessaie.'));
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const game = Object.assign({}, data, { type, createdAt: Date.now() });
  return db.ref('games/' + code).transaction(current => {
    if (current && current.createdAt && Date.now() - current.createdAt < ROOM_MAX_AGE_MS) {
      return; // code déjà pris par une partie récente : on annule
    }
    return game;
  }).then(result => (result.committed ? code : createRoom(type, data, attempt + 1)));
}

// Cherche la partie d'un code. Retourne { exists, type, game }.
function lookupRoom(code) {
  return db.ref('games/' + code).get().then(snap => {
    const game = snap.val();
    return { exists: !!game, type: game ? gameTypeOf(game) : null, game };
  });
}

// Si le code entré appartient à un autre jeu que la page actuelle, on envoie
// le joueur vers la bonne page (avec le code déjà rempli). Retourne true si
// une redirection a lieu.
function redirectIfOtherGame(type, expectedType, code) {
  if (type === expectedType || !GAME_TYPES[type]) return false;
  location.href = GAME_TYPES[type].playerPage + '?code=' + encodeURIComponent(code);
  return true;
}
