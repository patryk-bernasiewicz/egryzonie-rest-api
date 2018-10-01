const mongoose = require('mongoose');
const moment = require('moment');
const config = require('config');
const app = require('../../index');

class TestHelper {
  constructor() {
    this.momentize();
    this.server = null;
    this.db = null;
  }

  // Util methods
  async startDb() {
    const dbConfig = config.get('db');
    this.db = await mongoose
      .connect(dbConfig, { useNewUrlParser: true })
      .catch(err => console.error(err.message));
  }

  startServer() {
    console.log('Server listening...');
    this.server = app.listen();
  }

  closeServer() {
    if (this.server) {
      this.server.close();
    }
  }

  error(error) {
    console.error(error.message);
  }


  // Private methods
  momentize() {
    console.log('Test started at ' + moment().format('HH:mm:ss'));
  }
}

module.exports = TestHelper;