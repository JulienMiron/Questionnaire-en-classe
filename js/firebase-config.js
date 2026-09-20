// Remplace ces valeurs par celles de TON projet Firebase.
// Console Firebase > Paramètres du projet > Vos applications > Config du SDK.
// Voir le README pour la marche à suivre complète (c'est gratuit, ~5 minutes).
const firebaseConfig = {
  apiKey: "COLLE_TA_CLE_ICI",
  authDomain: "TON-PROJET.firebaseapp.com",
  databaseURL: "https://TON-PROJET-default-rtdb.firebaseio.com",
  projectId: "TON-PROJET",
  storageBucket: "TON-PROJET.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
