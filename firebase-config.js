const firebaseConfig = {
    apiKey: "AIzaSyCAiCs07zUaq4Ka5mUtPMmlY0nOQsBryrw",
    authDomain: "quiz-de8b2.firebaseapp.com",
    databaseURL: "https://quiz-de8b2-default-rtdb.firebaseio.com",
    projectId: "quiz-de8b2",
    storageBucket: "quiz-de8b2.appspot.com",
    messagingSenderId: "503932403241",
    appId: "1:503932403241:web:e7948613b15c1676a4a638",
    measurementId: "G-GH0PB4TNR8"
  };
  
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();