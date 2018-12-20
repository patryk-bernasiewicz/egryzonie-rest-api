const express = require('express');
require('express-async-errors');
const cors = require('cors');
const config = require('config');

const app = express();

const origin = config.get('allowedOrigins').split(';') || ['http://localhost:4200', 'http://localhost:4000'];

// this is a checking comment

app.use(cors({
  origin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['x-auth-token']
}));

require('./startup/config')();
require('./startup/passport')(app);
require('./startup/logging').init(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/validation')();
require('./startup/prod')(app);

// const port = process.env.PORT || 3000;
// const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = app;
