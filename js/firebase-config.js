// Config de ton projet Firebase "quiz-classejm".
const firebaseConfig = {
  apiKey: "AIzaSyCbs-f49jIfzSw54auKPWfuEHCP-bcE8D8",
  authDomain: "quiz-classejm.firebaseapp.com",
  databaseURL: "https://quiz-classejm-default-rtdb.firebaseio.com",
  projectId: "quiz-classejm",
  storageBucket: "quiz-classejm.firebasestorage.app",
  messagingSenderId: "629674286611",
  appId: "1:629674286611:web:717fb9ccbdd8dc0c69e9e6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();