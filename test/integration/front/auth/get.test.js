const path = require('path');
const fs = require('fs');
const request = require('supertest');
const mongoose = require('mongoose');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const config = require('config');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const TestHelper = require(path.resolve('test/helpers/test-helper'));
const AuthHelper = require(path.resolve('test/helpers/auth-helper'));

const testHelper = new TestHelper;
const authHelper = new AuthHelper;

let server;

describe('Auth integration tests', function() {
  this.timeout(15000);


  before(async () => {
    testHelper.startDb();
    testHelper.startServer();
    server = testHelper.server;
  });


  beforeEach(async () => {
    await authHelper.clear();
  })


  after(async () => {
    mongoose.models = {};
    mongoose.modelSchemas = {};
  });


  describe('GET /auth/me', () => {
    let token;

    const exec = () => {
      return request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);
    };


    beforeEach(async () => {
      const user = await authHelper.createUser();
      token = user.generateAuthToken();
    });


    it('token should be okay', async () => {
      const deserialized = jwt.verify(token, config.get('jwtPrivateKey'));
      const validated = mongoose.Types.ObjectId.isValid(deserialized._id);
      
      expect(validated).to.be.true;
    });


    it('should retrive user data', async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.haveOwnProperty('email');
      expect(res.body.email).to.equal(authHelper.userPayload.email);
    });

  });


  describe('GET /auth/remind_password', () => {
    let email;

    beforeEach(async () => {
      const user = await authHelper.createUser();
      email = user.email;
    });
    
    const exec = () => {
      const params = `email=${email}`;
      return request(server)
        .get(`/auth/remind_password?${params}`)
    };


    describe('Invalid payload', () => {

      it('should return 400 if email is invalid', async () => {
        email = 'invalid#email';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.match(/invalid email/i);
      });


      it('should return 201 if email is valid, but does not exist', async () => {
        email = 'totaly-valid@email.com';

        const res = await exec();

        expect(res.status).to.equal(200);

        const remind = await authHelper.retrievePasswordRemind(email);
        expect(remind).to.be.null;
      });

    });

    
    describe('Valid payload', () => {

      it('should return 200 if email is valid', async () => {
        let sendMailCalls = 0;

        // mock nodemailer transport because we don't want to send any emails
        nodemailer.createTransport = function() {
          return {
            originalMessage: '',
            sendMail: function(options, callback) {
              sendMailCalls++;
              if (callback) {
                callback(null, true);
              }
              return { originalMessage: '' };
            },
            verify: function(callback) {
              callback(null, true);
            }
          }
        }

        const res = await exec();

        expect(res.status).to.equal(200);

        const remind = await authHelper.retrievePasswordRemind(email);
        expect(remind).to.not.be.null;
        expect(remind).to.have.property('user');
        expect(remind.user).to.not.be.null;
        expect(remind.user).to.be.an('object');
        expect(remind).to.have.property('email');
        expect(remind.email).to.equal(email);
        expect(remind).to.have.property('token');
        expect(remind.token).to.be.a('string');
        expect(remind.token.length).to.equal(16);

        expect(sendMailCalls).to.be.above(0);
      });

    });


  });
});