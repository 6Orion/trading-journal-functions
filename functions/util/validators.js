/*
Helper functions
*/

const isEmpty = string => {
  if (string.trim() === '') return true;
  else return false;
};

const isUndefined = input => {
  if (input === undefined) return true;
  else return false;
};

const isEmail = email => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

const isPhoneNumber = phoneNumber => {
  const RegEx = /^\d{11,12}$/; // tests for cases without a "+"" in front phone number followed by 11-12 digits (ex. 385981234567)
  if (phoneNumber.match(RegEx)) return true;
  else return false;
};

exports.phoneNumberFormatter = phoneNumber => {
  const RegEx = /(^\+)|(\s|\(|\)|-+)/g; // Removes all whitespace, "-", "(", ")" and "+" characters
  return phoneNumber.replace(RegEx, '');
};

const isSlug = slug => {
  const RegEx = /^(([a-z0-9]*)-?)*$/;
  if (slug.match(RegEx)) return true;
  else return false;
};

/*
Main validators
*/

exports.hasProperties = (obj, props) => {
  /* Checks if an object has all properties provided in an array
  Example usage: 
  Verify if request's body has all the required properties/fields.

  Input: 
  obj > object: object to be tested
  props > array: properties to check against

  Output:
  object.reqErrors > object: returns all found errors
  object.validReq > boolean: returns true if there are no errors
  */

  let reqErrors = {};
  props.forEach(prop => {
    if (isUndefined(obj[prop])) {
      reqErrors[prop] = `Must not be undefined.`;
    }
  });
  return {
    reqErrors,
    validReq: Object.keys(reqErrors).length === 0 ? true : false
  };
};

exports.validateSignupData = data => {
  let errors = {};
  if (isEmpty(data.email)) {
    errors.email = 'Please enter your email.';
  } else if (!isEmail(data.email)) {
    errors.email = 'Please enter a valid email address in format: yourname@example.com';
  }
  if (isEmpty(data.password)) errors.password = 'Please enter your password.';
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = 'Please make sure that passwords match.';
  if (isEmpty(data.username)) errors.username = 'Please enter your username.';
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginData = data => {
  let errors = {};
  if (isEmpty(data.email)) errors.email = 'Please enter your email.';
  if (isEmpty(data.password)) errors.password = 'Please enter your password.';
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateStrategyData = data => {
  let errors = {};
  if (isEmpty(data.name)) errors.name = 'Please enter strategy name.';
  if (isEmpty(data.type)) errors.type = 'Please enter strategy type.';
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateTradeData = data => {
  let errors = {};
  if (isEmpty(data.ticker)) errors.ticker = 'Please enter trade ticker.';
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

/*
Reducers
*/

exports.reduceUserDetails = data => {
  let userDetails = {};
  if (!isEmpty(data.bio)) userDetails.bio = data.bio;
  if (!isEmpty(data.website)) {
    if (data.website.trim().substring(0, 4) !== 'http') {
      userDetails.website = `http://${data.website.trim()}`;
    } else userDetails.website = data.website;
  }
  if (!isEmpty(data.location)) userDetails.location = data.location;
  return userDetails;
};
