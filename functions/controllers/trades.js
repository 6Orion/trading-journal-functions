const { db } = require('../util/admin');
const firestore = require('firebase').firestore;

// Validators
const { hasProperties, validateTradeData } = require('../util/validators');

/* 
Controllers
*/

exports.createTrade = (req, res) => {
  const { valid, errors } = validateTradeData(req.body);
  if (!valid) return res.status(400).json(errors);

  const newTrade = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // TODO perform strategy calculations
  // update tradeCount, winRate, etc.
  // TODO use batch writes for several document updates
  // TODO use sharded counters

  const portfolioRef = db
    .collection('users')
    .doc(req.user.userId)
    .collection('portfolios')
    .doc(req.params.portfolioId);

  // Query
  portfolioRef
    .get()
    .then(doc => {
      if (doc.exists) {
        return portfolioRef.collection('trades').add(newTrade);
      } else {
        throw {
          portfolio: "Portfolio with this ID doesn't exist. Plese check your portfolio list."
        };
      }
    })
    .then(doc => {
      newTrade.tradeId = doc.id;
      // TODO update strategy details
      // TODO popisati strategy fieldove na bazi drugih trade journala i onog sto bih zelio imati

      return res.status(201).json(newTrade);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json(err);
    });
};

// Get one trade based on tradeId
exports.getUserTrade = (req, res) => {
  let tradeData = {};

  db.collection('users')
    .doc(req.user.userId)
    .collection('portfolios')
    .doc(req.params.portfolioId)
    .collection('trades')
    .doc(req.params.tradeId)
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw {
          message: "Trade with this ID doesn't exist. Plese check your trade list again."
        };
      }
      tradeData = doc.data(); // Unpack document snapshot data into an object
      tradeData.tradeId = doc.id; // Add the document snapshot ID to the object (otherwise unreachable)
      tradeData.createdAt = tradeData.createdAt.toDate();
      tradeData.updatedAt = tradeData.updatedAt.toDate();
      return res.status(200).json(tradeData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json(err);
    });
};

// Get all user's trades based on portfolioId
exports.getUserTradesByPortfolioId = (req, res) => {
  let trades = [];

  let portfolioRef = db
    .collection('users')
    .doc(req.user.userId)
    .collection('portfolios')
    .doc(req.params.portfolioId);

  portfolioRef
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw {
          message: "Portfolio with this ID doesn't exist. Plese check your portfolio list again."
        };
      } else {
        return portfolioRef.collection('trades').get();
      }
    })
    .then(data => {
      if (data) {
        data.forEach(doc => {
          console.log(JSON.stringify(doc).length);
          trades.push({
            ...doc.data(), // Unpack all document snapshot data
            tradeId: doc.id, // Add document ID as well
            createdAt: doc.data().createdAt.toDate()
          });
        });
        return res.status(200).json(trades);
      } else {
        return res
          .status(200)
          .json({ message: 'No trades found in this portfolio. Please add some!' });
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err,
        message: 'Something went wrong while fetching data.'
      });
    });
};

// Delete a trade based on strategyId and tradeId parameteres
exports.deleteTrade = (req, res) => {
  const tradeRef = db
    .collection('users')
    .doc(req.user.userId)
    .collection('portfolios')
    .doc(req.params.portfolioId)
    .collection('trades')
    .doc(req.params.tradeId);

  let tradeData;

  tradeRef
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw new Error('Not found.');
      }
      return tradeRef.delete();
    })
    // TODO update portfolio statistics and values
    .then(() => {
      res.json({ message: 'Trade deleted successfully.' });
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found.') {
        return res.status(404).json({ error: err.code, message: 'Trade not found.' });
      } else {
        return res.status(500).json({
          error: err.code,
          message: 'Something went wrong while deleting this trade.'
        });
      }
    });
};
