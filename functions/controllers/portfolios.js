const { db } = require('../util/admin');

// Validators
const { hasProperties, validatePortfolioData } = require('../util/validators');

/*
Controllers
*/

// Get user's own portfolio details based on portfolioId
exports.getUserPortfolio = (req, res) => {
  let portfolioData = {};

  db.collection('users')
    .doc(req.user.userId)
    .collection('portfolios')
    .doc(req.params.portfolioId)
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw new Error('Not found');
      }
      portfolioData = doc.data(); // Unpack document snapshot data into an object
      portfolioData.portfolioId = doc.id; // Add document ID as well
      portfolioData.createdAt = portfolioData.createdAt.toDate(); // Convert Timestamp object to Date object

      return res.status(200).json(portfolioData);
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found') {
        return res.status(404).json({ error: err, message: 'Portfolio not found.' });
      }
      return res.status(500).json({
        error: err.code,
        message: 'Something went wrong while fetching data.'
      });
    });
};

// List all portfolios of the user
exports.getAllPortfolios = (req, res) => {
  let portfolios = [];

  db.collection('users')
    .doc(req.user.userId)
    .collection('portfolios')
    .get()
    .then(data => {
      if (data) {
        data.forEach(doc => {
          portfolios.push({
            ...doc.data(), // Unpack all document snapshot data
            portfolioId: doc.id, // Add document ID as well
            createdAt: doc.data().createdAt.toDate()
          });
        });
        return res.status(200).json(portfolios);
      } else {
        return res.status(200).json({ message: 'No portfolios found.' });
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

exports.createPortfolio = (req, res) => {
  const { valid, errors } = validatePortfolioData(req.body);
  if (!valid) return res.status(400).json(errors);

  // Init object
  const newPortfolio = {
    ...req.body,
    tradeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Query
  db.collection('users')
    .doc(req.user.userId)
    .collection('portfolios')
    .add(newPortfolio)
    .then(docRef => {
      // Add document reference Id to existing object
      newPortfolio.portfolioId = docRef.id;
      // Return existing object
      return res.status(201).json(newPortfolio);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err,
        message: 'Something went wrong while processing query.'
      });
    });
};

exports.updatePortfolio = (req, res) => {
  const updates = {
    // TODO perform correct unpacking of selected fields only
    ...req.body,
    updatedAt: new Date()
  };

  // Init object
  let updatedPortfolio;

  // 2nd validation: user input
  const { valid, errors } = validatePortfolioData(updates);
  if (!valid) return res.status(400).json(errors);

  const portfolioRef = db
    .collection('users')
    .doc(req.user.userId)
    .collection('portfolios')
    .doc(req.params.portfolioId);

  // Query
  portfolioRef
    .get()
    // Validate if event exists in DB
    .then(doc => {
      if (!doc.exists) {
        throw new Error('Not found.');
      }

      // Object to be returned as JSON
      updatedPortfolio = {
        ...doc.data(),

        // TODO More precise update method has to be implemented
        // This method will cause data errors for all nested fields

        ...updates,
        createdAt: doc.data().createdAt.toDate(),
        portfolioId: doc.id
      };
      return portfolioRef.update(updates);
    })
    .then(() => {
      return res.status(201).json(updatedPortfolio);
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found.') {
        return res.status(400).json({
          error: err.code,
          message: "Portfolio with that ID doesn't exist."
        });
      } else {
        return res.status(500).json({
          error: err.code,
          message: 'Something went wrong while updating this document.'
        });
      }
    });
};

// Delete portfolio helper function
function deleteCollection(db, collectionRef, batchSize) {
  let query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve, reject);
  });
}

// Delete portfolio helper function
function deleteQueryBatch(db, query, resolve, reject) {
  query
    .get()
    .then(snapshot => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0;
      }

      // Delete documents in a batch
      let batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        return snapshot.size;
      });
    })
    .then(numDeleted => {
      if (numDeleted === 0) {
        resolve();
        return;
      }

      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, resolve, reject);
      });
    })
    .catch(reject);
}

// Delete portfolio controller
exports.deletePortfolio = (req, res) => {
  const portfolioRef = db
    .collection('users')
    .doc(req.user.userId)
    .collection('portfolios')
    .doc(req.params.portfolioId);

  portfolioRef
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw new Error('Not found.');
      }
      // Perform deep batch delete of "trades" sub-collection w/ documents which is
      // created for every portfolio document
      return deleteCollection(db, portfolioRef.collection('trades'), 200);
    })
    .then(() => {
      // Perform portfolio document deletion
      return portfolioRef.delete();
    })
    .then(() => {
      res.json({ message: 'Portfolio deleted successfully.' });
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found.') {
        return res.status(404).json({ error: err.code, message: 'Portfolio not found.' });
      } else {
        return res.status(500).json({
          error: err.code,
          message: 'Something went wrong while deleting this portfolio.'
        });
      }
    });
};
