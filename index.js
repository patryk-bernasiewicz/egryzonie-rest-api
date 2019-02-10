const path = require('path');
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const config = require('config');
const { APP_ENV } = require(path.resolve('src/environment'));

const app = express();


if (APP_ENV === 'public') {
  const origin = config.get('allowedOrigins').split(';');
  const corsOptions = {
    origin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['x-auth-token']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
} else {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
}

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
