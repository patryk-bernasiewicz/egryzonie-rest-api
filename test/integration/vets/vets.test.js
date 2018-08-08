const request = require('supertest');
const mongoose = require('mongoose');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');

const { Vet } = require('../../../src/models/vet');

let server;
let payload;

describe('Vet routes', () => {
  beforeEach(async () => {
    server = require('../../../index').listen();
  });

  afterEach(async () => {
    await server.close();
  });

  describe('GET /vets', () => {
    afterEach(async () => {
      await Vet.remove();
    });

    const exec = () => {
      return request(server)
        .get('/vets')
        .catch(err => { throw err; });
    };

    it('should return status 200 and an array', async () => {
      const res = await exec();
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should return valid amount of Vets', async () => {
      const vets = [
        {
          position: [ 43.12345, 34.54321 ],
          slug: 'super-weterynarz',
          name: 'Super Weterynarz',
          address: 'ul. Główna 1, 01-000 Warszawa',
          rodents: true,
          exoticAnimals: true,
          phone: '+48 123 456 789',
          accepted: true
        },
        {
          position: [ 43.12345, 34.54321 ],
          slug: 'super-weterynarz-2',
          name: 'Super Weterynarz 2',
          address: 'ul. Główna 2, 01-000 Warszawa',
          rodents: true,
          exoticAnimals: true,
          phone: '+48 123 456 789',
          accepted: true
        }
      ];

      await Vet.collection.insertMany(vets);

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(2);
    });
  });
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};