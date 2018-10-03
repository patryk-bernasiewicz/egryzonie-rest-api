const path = require('path');

const routes = require(path.resolve('src/routes/index'));

module.exports = (app) => {
  app.use(routes);
};
