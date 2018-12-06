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

mongoose.models = {};
mongoose.modelSchemas = {};

const { Vet } = require(path.resolve('src/models/vet'));
const { User } = require(path.resolve('src/models/user'));

let server;

describe('ADMIN Vets POST routes', function() {
  this.timeout(5000);

  let token;
  let admin;
  let regularUser;

  before(async () => {
    testHelper.startDb();
    testHelper.startServer();
    server = testHelper.server;

    admin = await authHelper.createAdmin();
    regularUser = await authHelper.createUser();
  });


  beforeEach(() => {
    vetHelper.populate();
    token = admin.generateAuthToken();
  });

  afterEach(() => {
    vetHelper.clear();
    // Clear mongoose models so that mocha's --watch works
    mongoose.models = {};
    mongoose.modelSchemas = {};
  });


  // POST /vets
  describe('POST /vets', async () => {
    let payload;
    beforeEach(() => {
      payload = {
        googleId: 'a',
        name: 'A Newly Added Vet',
        address: '4914 St Random Street, V5T 1Z7 Vancouver, British Columbia, Canada',
        rodents: true,
        exoticAnimals: true,
        websiteUrl: 'http://some-random-website-address.org/',
        phone: '+48 000 000 000'
      };
    });

    const exec = () => {
      return request(server)
        .post('/admin/vets')
        .send(payload)
        .set('Authorization', `Bearer ${token}`);
    }

    describe('Authentication', () => {
      it('should return 401 if user is not an admin', async () => {
        token = regularUser.generateAuthToken();
  
        const res = await exec();
  
        expect(res.status).to.equal(401);
        expect(res.body.message).to.match(/unauthorized/i);
      });
    });

    describe('Invalid payload', () => {

      // Name
      it('should return 400 if Google Maps ID is missing', async () => {
        delete payload.googleId;

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid google id/i);
      });
      
      it('should return 400 if name is missing', async () => {
        payload.name = '';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid name/i);
      });

      // Name
      it('should return 400 if name is invalid', async () => {
        payload.name = '#Some Invalid #!@#!@# Name   ';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid name/i);
      });
      
      it('should return 400 if name is missing', async () => {
        payload.name = '';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid name/i);
      });

      // Address
      it('should return 400 if address is missing', async () => {
        payload.address = '';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid address/i);
      });

      // Rodents
      it('should return 400 if rodents value is invalid', async () => {
        payload.rodents = 'string, not a boolean';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid rodents value/i);
      });

      it('should return 400 if rodents value is missing', async () => {
        payload.rodents = null;

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid rodents value/i);
      });

      // Exotic animals
      it('should return 400 if exotic animals is invalid', async () => {
        payload.exoticAnimals = 'string, not a boolean';

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid exotic animals value/i);
      });

      it('should return 400 if exotic animals is missing', async () => {
        payload.exoticAnimals = null;

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid exotic animals value/i);
      });

      // Website URL
      it('should return 400 if website URL is invalid', async () => {
        // payload.websiteUrl = 'htp://adfasdfasdf';
        payload.websiteUrl = true;

        const res = await exec();

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/invalid website url/i);
      });
    });

    describe('Valid payload', () => {
      it('should return 201 and create new Vet', async () => {
        const res = await exec();

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('vet');
        expect(res.body.vet).to.be.an('object');
        expect(res.body).to.have.property('location');
        expect(res.body.location).to.match(new RegExp('\/admin\/vets\/a-newly-added-vet', 'i'));

        const foundVet = await Vet.findOne({ name: payload.name }).populate('acceptedBy', '_id nickname');
        expect(foundVet).to.not.be.null;
        expect(foundVet).to.have.property('name');
        expect(foundVet.name).to.equal(payload.name);
        expect(foundVet.name).to.equal(res.body.vet.name);

        // default values
        expect(foundVet).to.have.property('rodents');
        expect(foundVet).to.have.property('exoticAnimals');
        expect(foundVet).to.have.property('accepted');
        expect(foundVet).to.have.property('acceptedDate');
        expect(foundVet).to.have.property('acceptedBy');
        expect(foundVet.rodents).to.equal(true);
        expect(foundVet.exoticAnimals).to.equal(true);
        expect(foundVet.accepted).to.equal(true);
        expect(foundVet.acceptedDate).to.be.a('date');
        expect(foundVet.acceptedBy).to.be.an('object');
      });
    });

  });
});