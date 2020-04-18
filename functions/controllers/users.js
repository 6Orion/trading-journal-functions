const { admin, db } = require('../util/admin');
const config = require('../util/FirebaseConfig');
const firebase = require('firebase');

// Validators
const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');

// Initialization
firebase.initializeApp(config);

/*
Controllers
*/

// "Create" controller

exports.signup = (req, res) => {
  // Validation of input
  const { valid, errors } = validateSignupData(req.body);
  if (!valid) return res.status(400).json(errors);

  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    username: req.body.username
  };

  let token, userId;
  const noImg = 'blank-avatar-transparent.png';

  // Creating user document
  db.collection('users')
    .where('username', '==', newUser.username)
    .limit(1)
    .get()
    // Validate if user exists in DB
    // If it's not there, add an user to AUTH app of firebase
    .then(querySnapshot => {
      if (querySnapshot.size !== 0) {
        throw {
          username: 'This username is already in use. Please choose another one.'
        };
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    // Add user to DB too (expanded data) that connects it to AUTH app of firebase
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`
      };
      return db.doc(`/users/${userId}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({
          email:
            'This email address has an existing account associated with it. Please use another one.'
        });
      } else {
        return res.status(500).json(err);
      }
    });
};

// Login controller
exports.login = (req, res) => {
  const { valid, errors } = validateLoginData(req.body);
  if (!valid) return res.status(400).json(errors);

  const user = {
    email: req.body.email,
    password: req.body.password
  };

  // Auth
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return res.status(403).json({
          message: 'Wrong credentials. Please try again.'
        });
      } else if (err.code === 'auth/user-not-found') {
        return res.status(403).json({
          message: 'Wrong credentials. Please try again.'
        });
      } else {
        return res.status(500).json({
          error: err.code,
          message: 'Something went wrong while logging in.'
        });
      }
    });
};

// Get own user details controller
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};

  db.doc(`/users/${req.user.userId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        throw {
          name: 'User not found.',
          message: 'User with that ID cannot be found.'
        };
      } else {
        userData.credentials = doc.data();
        userData.createdAt = userData.createdAt.toDate();
        return res.json(userData);
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code,
        message: 'Something went wrong while fetching user data.'
      });
    });
};

// Add user details controller
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.userId}`)
    .update(userDetails)
    .then(() => {
      return res.json({ message: 'Details added successfully.' });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code,
        message: 'Something went wrong while fetching user data.'
      });
    });
};

// Image Upload controller
exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: req.headers });
  let imageFileName;
  let imageToBeUploaded;

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      let errorMessage =
        'Wrong image type submitted. Please upload an image in .jpeg or .png format.';
      console.error(`Error: ${errorMessage}`);
      return res.status(400).json({ error: errorMessage });
    }
    const imageExtension = filename.split('.').pop();
    imageFileName = `${Math.round(Math.random() * 10000000000)}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket(config.storageBucket)
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.userId}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: 'Image uploaded successfully.' });
      })
      .catch(err => {
        console.error(err);
        if (err.message === 'Wrong image type submitted.') {
          console.error(
            'Wrong image type submitted. Please upload an image in .jpeg or .png format.'
          );
          return res.status(400).json({
            error: 'Wrong image type submitted. Please upload an image in .jpeg or .png format.'
          });
        } else {
          return res.status(500).json({ error: err.code });
        }
      });
  });
  busboy.end(req.rawBody);
};
