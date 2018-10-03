const express = require('express');
require('express-async-errors');

const app = express();

require('./startup/passport')(app);
require('./startup/logging').init();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

// const port = process.env.PORT || 3000;
// const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = app;
