const morgan = require('morgan');
const { createLogger, format, transports, exceptions } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: 'error',
  format: combine(
    label({ label: 'ERROR!' }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console()]
});

exports.init = function(app) {
  exceptions.handle(
    new transports.Console({ colorize: true, prettyPrint: true }),
    new transports.File({ filename: 'uncaught-exceptions.log' })
  );

  process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    logger.error('unhandledRejection', error);
  });


  if (process.env.NODE_ENV === 'development') {
    app.use(morgan(
      '[:date] Requested :method :url from :remote-addr',
      { immediate: true }
    ));
    
    app.use(morgan(
      '[:date] Sent response :status :res[content-length]b in :response-time ms')
    );
  }
};

exports.logger = logger;