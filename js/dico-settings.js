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
  // Points pour le détenteur de la vraie définition, pour chaque votant qui
  // trouve sa réécriture, à condition que certains la trouvent, mais pas tous.
  // Si personne ou tout le monde la trouve, il ne reçoit rien.
  pointsHolderPerFinder: 1,
  // Nombre maximal de caractères d'une définition.
  maxLength: 300
};
