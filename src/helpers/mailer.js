const path = require('path');
const nodemailer = require('nodemailer');
const Email = require('email-templates');
const config = require('config');

class Mailer {
  send(recipient, template, data = {}) {
    console.log('======================= Mailer.send called');
    const smtpConfig = require(path.resolve('config/smtp.json'));
    const transporter = nodemailer.createTransport(smtpConfig);
    const email = new Email({
      from: 'kontakt@e-gryzonie.pl',
      send: true,
      views: {
        options: {
          extension: 'mustache'
        }
      },
      transport: transporter
    });

    return email.send({
      template: template,
      message: {
        to: recipient
      },
      locals: {
        address: config.get('address'),
        frontUrl: config.get('front'),
        ...data
      }
    });
  }
}

module.exports = Mailer;
