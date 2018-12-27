const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
  console.log(info);
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

module.exports = createLogger({
  level: 'error',
  format: combine(
    label({ label: 'ERROR!' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console({ colorize: true, prettyPrint: true }),
    new transports.File({ filename: 'route-errors.log' })
  ]
});
