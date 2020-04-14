const { db } = require('../util/admin');

// Validators

const { hasProperties, validateStrategyData } = require('../util/validators');

/*
Controllers
*/

exports.getStrategy = (req, res) => {
  let strategyData = {};

  db.doc(`/strategies/${req.params.strategyId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw new Error('Not found');
      }
      strategyData = doc.data(); // Unpack document snapshot data into an object
      strategyData.strategyId = doc.id; // Add the document snapshot ID to the object (otherwise unreachable)
      return res.status(200).json(strategyData);
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found') {
        return res.status(404).json({ error: err, message: 'Strategy not found.' });
      }
      return res.status(500).json({
        error: err.code,
        message: 'Something went wrong while fetching data.'
      });
    });
};

exports.getAllStrategies = (req, res) => {
  let strategies = [];

  db.collection('strategies')
    .where('userId', '==', req.user.username)
    .get()
    .then(data => {
      if (data) {
        data.forEach(doc => {
          strategies.push({
            ...doc.data(), // Unpack all document snapshot data
            strategyId: doc.id // Add document ID as well
          });
        });
        return res.status(200).json(strategies);
      } else {
        return res.status(200).json({ message: 'No strategies found.' });
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code,
        message: 'Something went wrong while fetching data.'
      });
    });
};

// TODO add correct fields
exports.createStrategy = (req, res) => {
  // 1st validation: request data (required fields must not be undefined)
  const requiredFields = ['name', 'type'];

  const { validReq, reqErrors } = hasProperties(req.body, requiredFields);
  if (!validReq) return res.status(400).json(reqErrors);

  // Init strategy object
  const newStrategy = {
    ...req.body,
    trades: {},
    tradeCount: 0,
    userId: req.user.username,
    createdAt: new Date().toISOString()
  };

  // 2nd validation: user input
  const { valid, errors } = validateStrategyData(newStrategy);
  if (!valid) return res.status(400).json(errors);

  // Query
  db.collection('strategies')
    .add(newStrategy)
    .then(doc => {
      newStrategy.strategyId = doc.id;
      return db
        .doc(`/users/${req.user.username}`)
        .update({ [`strategies.${doc.id}`]: newStrategy });
    })
    .then(() => {
      return res.status(201).json(newStrategy);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err,
        message: 'Something went wrong while processing query.'
      });
    });
};

exports.updateEvent = (req, res) => {
  // TODO Step 1 slug verification only based on delivered data:
  // -> if there is a piece of data -> verify it
  // myabe there is a way to define schema//verification style function
  // which will add only data that matches keys that are allowed (Schema style)
  // and check for type as well!

  // 1st validation: request data (required fields must not be undefined)
  const requiredFields = ['name', 'slug', 'type'];

  const { validReq, reqErrors } = hasProperties(req.body, requiredFields);
  if (!validReq) return res.status(400).json(reqErrors);

  // Init event's object
  const updatedEvent = {
    ...req.body
  };

  // 2nd validation: user input
  const { valid, errors } = validateEventData(updatedEvent);
  if (!valid) return res.status(400).json(errors);

  // Query
  db.doc(`/events/${updatedEvent.slug}`)
    .get()
    // Validate if event exists in DB
    .then(doc => {
      if (!doc.exists) {
        throw new Error('Not found.');
      }
      return db.doc(`/events/${updatedEvent.slug}`).update(updatedEvent);
    })
    .then(() => {
      return res.status(201).json(updatedEvent);
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found.') {
        return res.status(400).json({
          error: err.code,
          message: "Event with that ID doesn't exist."
        });
      } else {
        return res.status(500).json({
          error: err.code,
          message: 'Something went wrong while updating this event.'
        });
      }
    });
};

// Delete an event controller
exports.deleteEvent = (req, res) => {
  const document = db.doc(`/events/${req.params.eventId}`);

  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw new Error('Not found.');
      }
      if (doc.data().authorId !== req.user.username) {
        throw new Error('Unauthorized action.');
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'Event deleted successfully.' });
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found.') {
        return res.status(404).json({ error: err.code, message: 'Event not found.' });
      } else if (err.message === 'Unauthorized action.') {
        return res.status(403).json({ error: err.code, message: 'Unauthorized action.' });
      } else {
        return res.status(500).json({
          error: err.code,
          message: 'Something went wrong while deleting this event.'
        });
      }
    });
};
