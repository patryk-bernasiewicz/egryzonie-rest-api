const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../index');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const { User } = require('../../../src/models/user');
const { Vet } = require('../../../src/models/vet');

let server;

describe('Vet routes', () => {
  beforeEach(async () => {
    server = require('../../../index').listen();
  });

  afterEach(async () => {
    await server.close();
  });

  describe('GET /vets', () => {
    it('should return status 200 and an array', async () => {
      const res = await request(server)
        .get('/vets')
        .catch(err => { throw err; });
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};