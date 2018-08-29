const request = require('supertest');
const mongoose = require('mongoose');
const faker = require('faker');
const moment = require('moment');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const mlog = require('mocha-logger');
const config = require('config');
const jwt = require('jsonwebtoken');

const error = err => console.error(err.message);

const { User } = require('../../../src/models/user');

const startDb = async function() {
  const dbConfig = config.get('db');
  db = await mongoose
    .connect(dbConfig, { useNewUrlParser: true })
    .catch(err => console.error(err.message));
};

const startServer = async function() {
  server = await require('../../../index').listen();
};

const closeServer = async function() {
  await server.close();
};

const clearUsers = async function() {
  await User.deleteMany({}).catch(error);
}

mlog.log('Test started at ' + moment().format('HH:mm:ss'));

describe('Auth integration tests', function() {
  this.timeout(15000);

  before(startDb);
  beforeEach(clearUsers);

  describe('Auth routes', () => {
    before(startServer);

    describe('POST /auth/signup', () => {
      let payload;

      beforeEach(() => {
        payload = {
          nickname: 'enslavedeagle',
          email: 'kontakt@patrykb.pl',
          password: '1234#asdF'
        };
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
        expect(res.body).to.haveOwnProperty('error');
        expect(res.body.error).to.match(/\"nickname\" length must be at least 5 characters long/);
      });

      it('should return 400 if email is invalid', async () => {
        payload.email = 'e';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body).to.haveOwnProperty('error');
        expect(res.body.error).to.match(/\"email\" must be a valid email/);
      });

      it('should return 400 if password is invalid', async () => {
        payload.password = 'a';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.error).to.match(/\"password\" length must be at least 5 characters long/);
      });

      it('should return 201 and a jwt token if payload is valid', async () => {
        const res = await exec();

        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');
        expect(res.header['x-auth-token']).to.not.be.null;

        const deserialized = jwt.verify(res.header['x-auth-token'], config.get('jwtPrivateKey'));
        const validated = mongoose.Types.ObjectId.isValid(deserialized._id);

        expect(validated).to.be.true;
      });
    });

    describe('POST /auth/signin', () => {
      let payload;

      beforeEach(async () => {
        payload = {
          email: 'kontakt@patrykb.pl',
          password: 'Abcdef12345'
        };
        await User.create({
          nickname: 'enslavedeagle',
          email: payload.email,
          password: payload.password
        }).catch(error);
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
        expect(res.body.error).to.match(/invalid payload/);
      });

      it('should return 400 if email does not exist', async () => {
        payload.email = 'pber92@gmail.com';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.error).to.match(/invalid login/);
      });

      it('should return 401 if password is invalid', async () => {
        payload.password = 'aaaa';

        const res = await exec();

        expect(res.status).to.equal(401);
        expect(res.body.error).to.match(/invalid login/);
      });

      it('should return 201 if payload matches user', async () => {
        const res = await exec();

        expect(res.status).to.equal(201);
        expect(res.header['x-auth-token']).to.not.be.null;

        const deserialized = jwt.verify(res.header['x-auth-token'], config.get('jwtPrivateKey'));
        const validated = mongoose.Types.ObjectId.isValid(deserialized._id);

        expect(validated).to.be.true;
      });
    });

    describe('POST /auth/me', () => {
      let token;

      const exec = () => {
        return request(server)
          .post('/auth/me')
          .set('Authorization', `Bearer ${token}`);
      };

      beforeEach(async () => {
        const user = await User.create({
          nickname: 'EnslavedEagle',
          email: 'kontakt@patrykb.pl',
          password: 'Abcdef12345#'
        }).catch(error);
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
        expect(res.body.email).to.equal('kontakt@patrykb.pl');
      });
    });

    after(closeServer);
  });
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};