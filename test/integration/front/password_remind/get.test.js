const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const { before, after, describe, it, beforeEach } = require('mocha');
const chai = require('chai');
const { stub } = require('sinon');
const SinonChai = require('sinon-chai');

chai.use(SinonChai);
const { expect } = chai;

const Mailer = require(path.resolve('src/helpers/mailer'));

const TestHelper = require(path.resolve('test/helpers/test-helper'));
const AuthHelper = require(path.resolve('test/helpers/auth-helper'));

const testHelper = new TestHelper();
const authHelper = new AuthHelper();

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
  });

  after(async () => {
    mongoose.models = {};
    mongoose.modelSchemas = {};
  });

  // ------------------------------

  describe('GET /remind-password', () => {
    let email;

    beforeEach(async () => {
      const user = await authHelper.createUser();
      email = user.email;
    });

    const exec = () => {
      const params = `email=${email}`;
      return request(server).get(`/remind-password?${params}`);
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

    // ------------------------------

    describe('Valid payload', () => {
      it('should return 200 if email is valid', async () => {
        const mailerStub = stub(Mailer.prototype, 'send').callsFake(() =>
          Promise.resolve()
        );

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

        expect(mailerStub).to.have.been.calledOnce;
      });
    });
  });

  // ------------------------------

  describe('GET /remind-password/validate', () => {
    let user;
    let remind;
    let token;

    beforeEach(async () => {
      user = await authHelper.createUser();
      remind = await authHelper.createPasswordRemind(user);
      token = remind.token;
    });

    const exec = () => {
      const params = `token=${token}`;
      return request(server).get(`/remind-password/validate?${params}`);
    };

    it('should generate user and remind', async () => {
      expect(user).to.be.an('object');
      expect(remind).to.be.an('object');
      expect(token).to.be.a('string');
      expect(token.length).to.equal(16);
    });

    it('should return 400 if token is not provided', async () => {
      token = '';

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.match(/token must be specified/i);
    });

    it('should return 404 if token is not found', async () => {
      token = 'JuStRaNdOmStRiNg';

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.match(/password remind request not found/i);
    });

    it('should return 200 if token is valid and found', async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.empty;
    });
  });
});
