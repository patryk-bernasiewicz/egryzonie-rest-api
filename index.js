const express = require('express');
const winston = require('winston');

const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);


const port = process.env.PORT || 3000;
winston.info(`Starting server on port ${port}!`);
const server = app.listen(port, () => winston.info(`Server listening on port ${port}...`));

module.exports = server;