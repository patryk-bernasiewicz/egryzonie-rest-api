const request = require('supertest');
const mongoose = require('mongoose');
const faker = require('faker');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const mlog = require('mocha-logger');
const config = require('config');

const { User } = require('../../../src/models/user');

const startDb = async function() {
  const dbConfig = config.get('db');
  db = await mongoose
    .connect(dbConfig, { useNewUrlParser: true })
    .catch(err => console.error(err.message));
};

const closeDb = async function() {
  await mongoose.connection.close();
};

const startServer = async function() {
  server = await require('../../../index').listen();
};

const closeServer = async function() {
  await server.close();
};


describe('Auth integration tests', function() {
  this.timeout(15000);

  describe('Auth routes', () => {

    let payload = {
      nickname: 'enslavedeagle',
      email: 'kontakt@patrykb.pl',
      password: '1234#asdF'
    };

    beforeEach(startServer);

    describe('POST /auth/signup', () => {

      const exec = () => {
        return request(server)
          .post('/auth/signup')
          .send(payload);
      };

      it('should return 400 if nickname is invalid', async () => {
        payload.nickname = 'a';
        
        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid nickname/);
      });

      it('should return 400 if email is invalid', async () => {
        payload.email = 'e';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid email/);
      });

      it('should return 400 if password is invalid', async () => {
        payload.password = 'a';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid password/);
      });

      it('should return 200 and a jwt token if payload is valid', async () => {
        const res = await exec();

        expect(res.status).to.equal(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.haveOwnProperty('token');
        expect(res.body.token).to.not.be.null;
      });

    });

    afterEach(closeServer);

  });
});