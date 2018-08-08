const winston = require('winston');
require('express-async-errors');

module.exports = function() {
  winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: 'uncaught-exceptions.log' })
  );

  process.on('unhandledRejection', ((ex) => {
    throw new Error(ex);
  }).bind(null, { exit: true }));
};
