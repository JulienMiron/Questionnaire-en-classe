// Réglages du jeu du dictionnaire.
const DICO_SETTINGS = {
  // Temps pour écrire une définition, en secondes (0 = pas de chrono :
  // l'animateur passe au vote lui-même).
  writingTime: 150,
  // Temps pour voter, en secondes (0 = pas de chrono).
  votingTime: 60,
  // Points pour un joueur qui vote pour la vraie définition.
  pointsCorrectVote: 2,
  // Points pour l'auteur d'une fausse définition, pour chaque vote reçu.
  pointsPerFooled: 1,
  // Points pour le joueur qui détient la vraie définition si personne ne la
  // trouve (0 pour désactiver).
  pointsHolderIfNobodyFinds: 2,
  // Nombre maximal de caractères d'une définition.
  maxLength: 300
};
