const morgan = require('morgan');
const { NODE_ENV } = require('../src/environment');
const { transports, exceptions } = require('winston');
const logger = require('../src/helpers/logger');

exports.init = function(app) {
  exceptions.handle(
    new transports.Console({ colorize: true, prettyPrint: true }),
    new transports.File({ filename: 'uncaught-exceptions.log' })
  );

  process.on('unhandledRejection', error => {
    logger.error('unhandledRejection', error);
  });


  if (NODE_ENV === 'development') {
    app.use(morgan(
      '[:date] Requested :method :url from :remote-addr',
      { immediate: true }
    ));
    
    app.use(morgan(
      '[:date] Sent response :status :res[content-length]b in :response-time ms')
    );
  }
};