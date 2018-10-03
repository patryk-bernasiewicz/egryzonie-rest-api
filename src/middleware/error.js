const path = require('path');
const { logger } = require(path.resolve('startup/logging'));

const { ValidationError, DatabaseError, AuthorizationError } = require('../error-types');

module.exports = function(err, req, res) {
  logger.error('FATAL ERROR!\n', err.message);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({ message: err.message });
  }

  if (err instanceof AuthorizationError) {
    return res.status(401).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Something unexpected happened.' });
};
