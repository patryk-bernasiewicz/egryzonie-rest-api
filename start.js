const app = require('./index');
const logger = require('./src/helpers/logger');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info('Server listening on ' + port);
});
