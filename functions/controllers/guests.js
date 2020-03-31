const { db } = require('../util/admin');

// Validators

const { hasProperties, phoneNumberFormatter, validateGuestData } = require('../util/validators');

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
      guestData = doc.data(); // Unpack document snapshot data into an object
      guestData.strategyId = doc.id; // Add the document snapshot ID to the object (otherwise unreachable)
      return res.status(200).json(strategyData);
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found') {
        return res.status(404).json({ error: err.code, message: 'Strategy not found.' });
      }
      return res.status(500).json({
        error: err.code,
        message: 'Something went wrong while fetching strategy data.'
      });
    });
};

exports.getAllGuests = (req, res) => {
  console.log(res, req, 'Pozvan getAllGuests');
  let guests = [];

  // Fetch the event
  db.doc(`/events/${req.params.eventId}`) //TODO: je li ode treba guests?!
    .get()
    .then(doc => {
      // Check if the event exists and if user is it's author
      if (!doc.exists) {
        throw new Error('Not found');
      } else if (doc.data().authorId !== req.user.username) {
        throw new Error('Not authorized');
      }
      // If event is found, return it's guest list
      return db
        .collection('guests')
        .where('eventId', '==', req.params.eventId)
        .orderBy('lastName', 'asc')
        .get();
    })
    // Unpack guest data
    .then(data => {
      data.forEach(doc => {
        guests.push({
          ...doc.data(), // Unpack all document snapshot data
          guestId: doc.id // Add document ID as well
        });
      });
      return res.status(200).json(guests);
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found') {
        return res.status(404).json({ error: err.code, message: 'Event not found' });
      } else if (err.message === 'Not authorized') {
        return res.status(404).json({
          error: err.code,
          message: 'Not authorized to access that event.'
        });
      }
      return res.status(500).json({
        error: err.code,
        message: 'Something went wrong while fetching guest data.'
      });
    });
};

exports.createGuest = (req, res) => {
  // 1st validation: request data (required fields must not be undefined)
  const requiredFields = ['firstName', 'lastName', 'phoneNumber'];

  const { validReq, reqErrors } = hasProperties(req.body, requiredFields);
  if (!validReq) return res.status(400).json(reqErrors);

  // Init guest's object
  const newGuest = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    authorId: req.user.username,
    eventId: req.body.eventId,
    phoneNumber: phoneNumberFormatter(req.body.phoneNumber),
    createdAt: new Date().toISOString(),
    replied: false
  };

  // 2nd validation: user input
  const { valid, errors } = validateGuestData(newGuest);
  if (!valid) return res.status(400).json(errors);

  // Query
  db.collection('guests')
    .add(newGuest)
    .then(doc => {
      let returnedGuest = newGuest;
      returnedGuest.guestId = doc.id;
      return res.status(201).json(returnedGuest);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code,
        message: 'Something went wrong while adding your guest.'
      });
    });
};

exports.updateGuest = (req, res) => {
  // TODO Remove 1st validation, actually just check for phoneNumber in
  // case you need to format it, rest of it is just a limitation

  // 1st validation: request data (required fields must not be undefined)
  const requiredFields = ['firstName', 'lastName', 'phoneNumber'];

  const { validReq, reqErrors } = hasProperties(req.body, requiredFields);
  if (!validReq) return res.status(400).json(reqErrors);

  // Init guest's object
  const updatedGuest = {
    ...req.body, // properly list each field once they are ultimately defined
    phoneNumber: phoneNumberFormatter(req.body.phoneNumber)
  };

  // 2nd validation: user input
  const { valid, errors } = validateGuestData(updatedGuest);
  if (!valid) return res.status(400).json(errors);

  // Query
  db.doc(`/guests/${req.params.guestId}`)
    .update(updatedGuest)
    .then(() => {
      return res.status(200).json({ message: 'Details updated successfully.' });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code,
        message: 'Something went wrong while updating guest details.'
      });
    });
};

exports.deleteGuest = (req, res) => {
  const document = db.doc(`/guests/${req.params.guestId}`);
  document
    .get(doc => {
      if (!doc.exists) {
        throw new Error('Not found.');
      }
      if (doc.data().author !== req.user.username) {
        throw new Error('Not authorized.');
      }
      return document.delete();
    })
    .then(() => {
      return res.status(200).json({ message: 'Guest deleted successfully.' });
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found.') {
        return res.status(404).json({
          error: err.code,
          message: 'Guest with that ID has not been found.'
        });
      } else if (err.message === 'Not authorized.') {
        return res.status(403).json({
          error: err.code,
          message: 'You are not authorized to delete that guest.'
        });
      } else {
        return res.status(500).json({
          error: err.code,
          message: 'Something went wrong while deleting a guest.'
        });
      }
    });
};

exports.getInvitation = (req, res) => {
  let invitationData = {};

  db.doc(`/invitations/${req.params.invitationId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw new Error('Not found');
      } else {
        invitationData = doc.data(); // Unpack document snapshot data into an object
        invitationData.id = doc.id; // Add the document snapshot ID to the object (otherwise unreachable)
        return res.status(200).res.json(invitationData);
      }
    })
    .catch(err => {
      console.error(err);
      if (err.message === 'Not found') {
        return res.status(404).json({ error: err.code, message: 'Invitation not found.' });
      }
      return res.status(500).json({
        error: err.code,
        message: "Something went wrong while fetching guest's data."
      });
    });
};
