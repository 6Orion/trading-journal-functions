const { db } = require('../util/admin');

// Validators

const { hasProperties, validateTradeData } = require('../util/validators');

exports.createTrade = (req, res) => {
  // 1st validation: request data (required fields must not be undefined)
  const requiredFields = ['ticker'];

  const { validReq, reqErrors } = hasProperties(req.body, requiredFields);
  if (!validReq) return res.status(400).json(reqErrors);

  // Init strategy object
  const newTrade = {
    ...req.body,
    userId: req.user.username,
    strategyId: req.params.strategyId,
    createdAt: new Date().toISOString()
  };

  // 2nd validation: user input
  const { valid, errors } = validateStrategyData(newStrategy);
  if (!valid) return res.status(400).json(errors);

  // TODO perfrom strategy calculations
  // update tradeCount, winRate, etc.
  let strategy;

  // TODO refactor everything to containt doc() call prije nego se seta novi data, pa se moze iskorisitit doc.id i postaviti odmah u dokument
  // TODO use batch writes for several document updates
  // TODO use sub-collection for trades
  // TODO use sharded counters
  // Query
  db.doc(`/strategies/${newTrade.strategyId}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        strategy = doc.data();

        return db.collection('trades').add(newTrade);
      } else {
        throw {
          strategy: "Strategy with this ID doesn't exist. Plese check your strategies list."
        };
      }
    })
    .then(doc => {
      newTrade.tradeId = doc.id;
      // TODO update strategy details
      // TODO popisati strategy fieldove na bazi drugih trade journala i onog sto bih zelio imati
      const newTradeDetails = {
        tradeId: doc.id,
        ticker: newTrade.ticker,
        createdAt: newTrade.createdAt
      };
      return db
        .doc(`/strategies/${newTrade.strategyId}`)
        .update({ [`trades.${doc.id}`]: newTradeDetails });
    })
    .then(() => {
      return res.status(201).json(newTrade);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json(err);
    });
};

exports.getTrade = (req, res) => {
  let tradeData = {};

  db.doc(`/trades/${req.params.tradeId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw {
          message: "Trade with this ID doesn't exist. Plese check your trade list again."
        };
      }
      tradeData = doc.data(); // Unpack document snapshot data into an object
      tradeData.tradeId = doc.id; // Add the document snapshot ID to the object (otherwise unreachable)
      return res.status(200).json(tradeData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json(err);
    });
};

exports.getAllTradesByStrategyId = (req, res) => {
  let trades = [];

  db.collection('trades')
    .where('strategyId', '==', req.params.strategyId)
    .get()
    .then(data => {
      if (data) {
        data.forEach(doc => {
          trades.push({
            ...doc.data(), // Unpack all document snapshot data
            tradeId: doc.id // Add document ID as well
          });
        });
        return res.status(200).json(trades);
      } else {
        return res.status(200).json({ message: 'No trades found for this strategy.' });
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

exports.getAllTradesByStrategyId = (req, res) => {
  let trades = [];

  db.collection('trades')
    .where('strategyId', '==', req.params.strategyId)
    .get()
    .then(data => {
      if (data) {
        data.forEach(doc => {
          trades.push({
            ...doc.data(), // Unpack all document snapshot data
            tradeId: doc.id // Add document ID as well
          });
        });
        return res.status(200).json(trades);
      } else {
        return res.status(200).json({ message: 'No trades found for this strategy.' });
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

exports.deleteTrade = (req, res) => {
  const document = db.doc(`/trades/${req.params.tradeId}`);
  let tradeData;
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw new Error('Not found.');
      }
      tradeData = doc.data();
      if (tradeData.userId !== req.user.username) {
        throw new Error('Unauthorized action.');
      } else {
        return document.delete();
      }
    })
    .then(() => {
      db.doc(`/strategies/${tradeData.strategyId}/trades`).update({
        [req.params.tradeId]: firebase.firestore.FieldValue.delete()
      });
    })
    .then(() => {
      res.json({ message: 'Event deleted successfully.' });
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found.') {
        return res.status(404).json({ error: err.code, message: 'Trade not found.' });
      } else if (err.message === 'Unauthorized action.') {
        return res
          .status(403)
          .json({
            error: err.code,
            message: 'Unauthorized action: You are not an author of this trade.'
          });
      } else {
        return res.status(500).json({
          error: err.code,
          message: 'Something went wrong while deleting this event.'
        });
      }
    });
};
