const path = require('path');
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const config = require('config');
const { APP_ENV } = require(path.resolve('src/environment'));

const app = express();

let corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['x-auth-token']
};

if (APP_ENV === 'public') {
  corsOptions.origin = config.get('allowedOrigins').split(';') || '*';
}

console.log('CORS: ', corsOptions);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
