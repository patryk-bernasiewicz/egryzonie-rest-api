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

describe('ADMIN Vets PUT routes', function() {
  this.timeout(15000);

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


  after(() => {
    // Clear mongoose models so that mocha's --watch works
    mongoose.models = {};
    mongoose.modelSchemas = {};
    vetHelper.clear();
    testHelper.closeServer();
  });


  beforeEach(() => {
    vetHelper.populate();
    token = admin.generateAuthToken();
  });


  // PUT /vets
  describe('PUT /vets', async () => {
    
    let payload;
    let savedVet;
    before(async () => {
      savedVet = new Vet({
        position: {
          type: 'Point',
          coordinates: [ 0.000000, 0.000000 ]
        },
        name: 'A Newly Added Vet',
        address: '4914 St Random Street, V5T 1Z7 Vancouver, British Columbia, Canada'
      });
      await savedVet.save();
    });

    beforeEach(() => {
      payload = {
        position: [ 15.000000, 15.000000 ],
        name: 'Even More Newly Added Vet',
        address: '2137 rue Principale, La Sarre, Quebec, Canada',
        rodents: true,
        exoticAnimals: true,
        websiteUrl: 'http://some-random-website-address.org/',
        phone: '+48 000 000 000'
      };
    });

    const exec = () => {
      const route = `/admin/vets/${savedVet._id}`;
      return request(server)
        .put(route)
        .send(payload)
        .set('Authorization', `Bearer ${token}`);
    }

    it('should return 401 if user is not an admin', async () => {
      const regularUser = await new User({
        nickname: 'RegularUser',
        email: 'regular@user.net',
        password: 'RegularUserPassword'
      }).save();
      token = regularUser.generateAuthToken();

      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body.message).to.match(/unauthorized/i);
    });

    // Position
    it('should return 400 if position is invalid', async () => {
      payload.position = [10000,20000];

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body.message).to.match(/invalid position/i);
    });

    it('should return 400 if position is missing', async () => {
      payload.position = [];

      const res = await exec();

      expect(res.status).to.equal(400);
      expect(res.body.message).to.match(/invalid position/i);
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

    it('gets the Vet updated and returns it', async () => {
      expect(2+2).to.equal(4);
      
      const res = await exec();

      expect(res.status).to.equal(200);
      
      expect(res.body).to.have.property('vet');
      expect(res.body.vet).to.be.an('object');
      expect(res.body.vet).to.have.property('name');
      expect(res.body.vet.name).to.equal(payload.name);
      expect(res.body.vet.address).to.equal(payload.address);

      expect(res.body).to.have.property('location');
      expect(res.body.location).to.be.a('string');
    });
    
  });
});