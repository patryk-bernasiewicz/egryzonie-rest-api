const winston = require('winston');

module.exports = function(err, req, res, next) {
  winston.error(err);
  return res.status(500).send('Something failed.');
};
