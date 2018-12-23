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


  describe('POST /auth/signup', () => {
    let payload;

    beforeEach(() => {
      payload = { ...authHelper.userPayload };
    });

    const exec = () => {
      return request(server)
        .post('/auth/signup')
        .send(payload);
    };
    

    it('should return 400 if nickname is invalid', async () => {
      payload.nickname = 'a';
      
      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.haveOwnProperty('message');
      expect(res.body.message).to.match(/\"nickname\" length must be at least 5 characters long/);
    });


    it('should return 400 if email is invalid', async () => {
      payload.email = 'e';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.haveOwnProperty('message');
      expect(res.body.message).to.match(/\"email\" must be a valid email/);
    });


    it('should return 400 if password is invalid', async () => {
      payload.password = 'a';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body.message).to.match(/\"password\" length must be at least 5 characters long/);
    });


    it('should return 400 if agreement is not checked', async () => {
      payload.signupAgreement = false;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body.message).to.match(/\"signupAgreement\" must be checked/);
    });


    it('should return 201 and a jwt token if payload is valid', async () => {
      const res = await exec();

      expect(res.status).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.header['x-auth-token']).to.not.be.null;

      expect(res.body).to.have.property('nickname');
      expect(res.body.nickname).to.equal(payload.nickname);

      expect(res.body).to.have.property('role');
      expect(res.body.role).to.equal('user');

      expect(res.body).to.not.have.property('password');
      expect(res.body).to.not.have.property('avatarURL');

      const deserialized = jwt.verify(res.header['x-auth-token'], config.get('jwtPrivateKey'));
      const validated = mongoose.Types.ObjectId.isValid(deserialized._id);

      expect(validated).to.be.true;
    });
  });


  describe('POST /auth/signin', () => {
    let payload;

    beforeEach(async () => {
      payload = { ...authHelper.userPayload };
      await authHelper.createUser();
    });
    
    const exec = async () => {
      return request(server)
        .post('/auth/signin')
        .send(payload);
    };


    it('should return 400 if payload is invalid', async () => {
      payload.email = null;

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body.message).to.match(/invalid payload/);
    });


    it('should return 401 if email does not exist', async () => {
      payload.email = 'pber92@gmail.com';

      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body.message).to.match(/invalid login/);
    });


    it('should return 401 if password is invalid', async () => {
      payload.password = 'aaaa';

      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.match(/invalid login/);
    });


    it('should return 201 if payload matches user', async () => {
      const res = await exec();

      expect(res.status).to.equal(201);
      expect(res.header['x-auth-token']).to.not.be.null;

      expect(res.body).to.have.property('nickname');
      expect(res.body.nickname).to.equal(payload.nickname);

      expect(res.body).to.have.property('role');
      expect(res.body.role).to.equal('user');

      expect(res.body).to.not.have.property('password');

      const deserialized = jwt.verify(res.header['x-auth-token'], config.get('jwtPrivateKey'));
      const validated = mongoose.Types.ObjectId.isValid(deserialized._id);

      expect(validated).to.be.true;
    });
  });

});