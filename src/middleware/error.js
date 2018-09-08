const winston = require('winston');

const { ValidationError, DatabaseError, AuthorizationError } = require('../error-types');

module.exports = function(err, req, res, next) {
  winston.error(err.message);
  
  if (err instanceof ValidationError) {
    return res.status(400).send(err.message);
  }

  if (err instanceof DatabaseError) {
    return res.status(500).send(err.message);
  }

  if (err instanceof AuthorizationError) {
    return res.status(401).send(err.message);
  }

  return res.status(500).send('Something unexpected happened.');
};
