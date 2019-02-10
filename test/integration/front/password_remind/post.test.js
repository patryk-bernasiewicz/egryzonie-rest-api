const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const nodemailer = require('nodemailer');

const TestHelper = require(path.resolve('test/helpers/test-helper'));
const AuthHelper = require(path.resolve('test/helpers/auth-helper'));

const testHelper = new TestHelper;
const authHelper = new AuthHelper;

let server;


describe('Remind Password integration tests', function() {
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


  describe('POST /remind-password/change', () => {
    let user;
    let remind;
    let token;
    let payload;

    beforeEach(async () => {
      user = await authHelper.createUser();
      remind = await authHelper.createPasswordRemind(user);
      token = remind.token;
      payload = {
        password: 'Abcd1234'
      };
    });
    
    const exec = () => {
      return request(server)
        .post(`/remind-password/change?token=${token}`)
        .send(payload);
    };

    it('should return 400 if token is not present', async () => {
      token = '';
      
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.match(/token must be specified/i);
    });

    it('should return 404 if token is not found in DB', async () => {
      token = 'uknown-token';

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.match(/password remind request not found/i);
    });

    it('should return 400 if new password is not present', async () => {
      payload = {};

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.match(/new password is required/i);
    });

    it('should return 200 if everything is okay', async () => {
      const res = await exec();

      expect(res.status).to.equal(204);
      expect(res.body).to.not.have.property('message');

      // verify password was changed
      const verifyPassword = await authHelper.verifyPassword(remind.user._id, payload.password);
      expect(verifyPassword).to.equal(true);
    });

  });
});