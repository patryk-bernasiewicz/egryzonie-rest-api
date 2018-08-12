const request = require('supertest');
const mongoose = require('mongoose');
const faker = require('faker');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');

const { Vet } = require('../../../src/models/vet');

let server;
let path;

const vets = [
  { name: 'Abc', address: '123 St.' },
  { name: 'Def', address: '234 St.' },
  { name: 'Ghi', address: '345 St.' },
  { name: 'Jkl', address: '456 St.' },
  { name: 'Mno', address: '567 St.' },
  { name: 'Pqr', address: '678 St.' },
  { name: 'Stu', address: '890 St.' },
  { name: 'Zzz Caffee', address: 'Zzz St.' }
];


describe('Vet routes', function () {
  this.timeout(10000);

  beforeEach(async () => {
    server = await require('../../../index').listen();
  });

  describe('GET /vets', function () {
    this.timeout(10000);

    path = '/vets';

    const exec = () => {
      return request(server)
        .get(path)
        .catch(err => { throw err; });
    };

    beforeEach(async () => {
      await Vet.collection.insertMany(vets);
    });

    it('should return valid amount of Vets', async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(vets.length);
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.equal(vets[0].name);
    });

    it('should filter vets if name parameter is provided', async () => {
      path = '/vets?term=abc';

      const specificVet = vets[0];

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1);
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.equal(specificVet.name);
    });

    it('should filter vets if address parameter is provided', async () => {
      path = '/vets?term=23';

      const specificVets = [ vets[0], vets[1] ];

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(2);
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.equal(specificVets[0].name);
      expect(res.body[1]).to.haveOwnProperty('name');
      expect(res.body[1].name).to.equal(specificVets[1].name);
    });

    it('should show only few vets if limit is set', async () => {
      path = '/vets?limit=5';

      const specificVet = vets[0];

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(5);
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.equal(specificVet.name);
    });

    it('should find the matching vet', async () => {
      path = '/vets?term=zzz';

      const specificVet = vets[7];

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1);
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.equal(specificVet.name);
    });

    afterEach(async function () {
      await Vet.remove();
    });
  });


  afterEach(async () => {
    await server.close();
  });

});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};