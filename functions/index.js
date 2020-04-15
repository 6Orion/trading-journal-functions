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

const {
  getUserPortfolio,
  getAllPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
} = require('./controllers/portfolios');
const {
  createTrade,
  getUserTrade,
  getUserTradesByPortfolioId,
  deleteTrade
} = require('./controllers/trades');

/*
User routes
*/

app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FirebaseAuth, uploadImage);
app.post('/user', FirebaseAuth, addUserDetails);
app.get('/user', FirebaseAuth, getAuthenticatedUser);

/*
Portfolio routes
*/

app.get('/portfolio/:portfolioId', FirebaseAuth, getUserPortfolio);
app.post('/portfolio/:portfolioId', FirebaseAuth, updatePortfolio);
app.get('/portfolio', FirebaseAuth, getAllPortfolios);
app.post('/portfolio', FirebaseAuth, createPortfolio);
app.delete('/portfolio/:portfolioId', FirebaseAuth, deletePortfolio);

/*
Trade routes
*/
app.post('/portfolio/:portfolioId/trade', FirebaseAuth, createTrade);
app.get('/portfolio/:portfolioId/trade', FirebaseAuth, getUserTradesByPortfolioId);
app.get('/portfolio/:portfolioId/trade/:tradeId', FirebaseAuth, getUserTrade);
app.delete('/portfolio/:portfolioId/trade/:tradeId', FirebaseAuth, deleteTrade);

/*
Export API
*/
exports.api = functions.region('europe-west1').https.onRequest(app);
