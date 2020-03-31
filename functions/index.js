const functions = require('firebase-functions');
const app = require('express')();
const { db } = require('./util/admin');

// Middleware
const FirebaseAuth = require('./util/FirebaseAuth');

// Controllers
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require('./controllers/users');

const { getStrategy, getAllStrategies, createStrategy } = require('./controllers/strategies');

/*
User routes
*/

app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FirebaseAuth, uploadImage);
app.post('/user', FirebaseAuth, addUserDetails);
app.get('/user', FirebaseAuth, getAuthenticatedUser);

/*
Strategy routes
*/

app.get('/strategy/:strategyId', FirebaseAuth, getStrategy);
app.get('/strategy', FirebaseAuth, getAllStrategies);
app.post('/strategy', FirebaseAuth, createStrategy);

/*
Export API
*/
exports.api = functions.region('europe-west1').https.onRequest(app);
