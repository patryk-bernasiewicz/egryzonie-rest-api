const winston = require('winston');

module.exports = function(err, req, res) {
  winston.error(err.message, err);

  return res.status(500).send('Something failed.');
};
