const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const config = require('config');
const jwt = require('jsonwebtoken');

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

});