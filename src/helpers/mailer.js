const nodemailer = require('nodemailer');
const config = require('config');
const path = require('path');

class Mailer {
  constructor() {
    this._setUp();
  }

  send(options) {
    if (!this.transporter) {
      throw new Error('No transporter found!');
    }

    return this._send(options);
  }

  // promisify transporter's sendMail()
  _send(options) {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(options, function(err, info) {
        if (err) {
          reject(err);
        }

        resolve(info);
      });
    });
  }

  _setUp() {
    const smtpConfig = require(path.resolve('config/smtp.json'));

    this.transporter = nodemailer.createTransport(smtpConfig);
  }
}

module.exports = Mailer;