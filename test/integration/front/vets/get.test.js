const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');

const TestHelper = require(path.resolve('test/helpers/test-helper'));
const VetHelper = require(path.resolve('test/helpers/vet-helper'));
const AuthHelper = require(path.resolve('test/helpers/auth-helper'));

const testHelper = new TestHelper;
const vetHelper = new VetHelper;
const authHelper = new AuthHelper;

let server;

describe('FRONT Vets GET routes', function() {
  this.timeout(15000);

  let vets;


  before(async () => {
    testHelper.startDb();
    testHelper.startServer();
    server = testHelper.server;
    
    await vetHelper.populate();
    vets = vetHelper.vets;
  });


  after(async () => {
    await vetHelper.clear();
    mongoose.models = {};
    mongoose.modelSchemas = {};
  });
  

  describe('GET /vets', function () {
    let route = '/vets';

    const exec = () => {
      return request(server)
        .get(route)
        .catch(err => { throw err; });
    };


    it('should return valid amount of Vets', async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(vets.length);
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.equal(vets[0].name);
    });


    it('should filter vets if name parameter is provided', async () => {
      route = '/vets?term=abc';

      const specificVet = vets[0];

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1);
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.equal(specificVet.name);
    });


    it('should filter vets if address parameter is provided', async () => {
      route = '/vets?term=23';

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
      route = '/vets?limit=5';

      const specificVet = vets[0];

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(5);
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.equal(specificVet.name);
    });


    it('should find the matching vet', async () => {
      route = '/vets?term=zzz';

      const specificVet = vets[7];

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1);
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.equal(specificVet.name);
    });
  });
});