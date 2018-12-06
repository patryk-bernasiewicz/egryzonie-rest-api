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
  let specificVet;


  before(async () => {
    testHelper.startDb();
    testHelper.startServer();
    server = testHelper.server;
    
    vets = await vetHelper.populate();
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
        .get(route);
    };


    it('should return valid amount of Vets', async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(vets.length);
    });


    it('should filter vets if name parameter is provided', async () => {
      route = '/vets?term=abc';

      const specificVet = vets[0];

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1);
    });


    it('should filter vets if address parameter is provided', async () => {
      route = '/vets?term=23';

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(2);
    });


    it('should show only few vets if limit is set', async () => {
      route = '/vets?limit=5';

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(5);
    });


    it('should find the matching vet', async () => {
      route = '/vets?term=zzz';

      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1);
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.equal(vets[7].name);
    });
  });


  describe('GET /vets/:slug', () => {
    let route;

    beforeEach(() => {
      route = '/vets/' + vetHelper.vets[0].slug;
    });

    const exec = () => {
      return request(testHelper.server)
        .get(route);
    };


    it('should return 404 when vet does not exist', async () => {
      route = '/vets/123-non-existing-vet';
      
      const res = await exec();

      expect(res.status).to.equal(404);
    });


    it('should return 200 and vet data', async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).have.property('name');
      expect(res.body.name).to.equal(vetHelper.vets[0].name);
    });
  });
});