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

describe('ADMIN Vets GET routes', function() {
  this.timeout(15000);

  let token;
  let admin;
  let regularUser;
  let vets;

  before(async () => {
    testHelper.startDb();
    testHelper.startServer();
    server = testHelper.server;

    await vetHelper.clear();

    vets = await vetHelper.populate();
    admin = await authHelper.createAdmin();
    regularUser = await authHelper.createUser();
  });


  after(async () => {
    // Clear mongoose models so that mocha's --watch works
    mongoose.models = {};
    mongoose.modelSchemas = {};
    testHelper.closeServer();
    
    await vetHelper.clear();
  });


  beforeEach(async () => {
    token = admin.generateAuthToken();
  });


  // GET /admin/vets
  describe('GET /vets', async () => {

    const exec = () => {
      return request(server)
        .get('/admin/vets')
        .set('Authorization', `Bearer ${token}`);
    };

    it('should return 401 if user is not an admin', async () => {
      token = regularUser.generateAuthToken();

      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body.message).to.match(/unauthorized/);
    });

    it('should return 200 and return list of vets', async () => {
      const res = await exec();

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');

      expect(res.body).to.have.property('total');
      expect(res.body.total).to.be.a('number');
      expect(res.body.total).to.equal(vetHelper.payload.length);

      expect(res.body).to.have.property('vets');
      expect(res.body.vets).to.be.an('array');
      expect(res.body.vets.length).to.equal(vetHelper.payload.length);
      expect(res.body.vets[0]).to.be.an('object');
      expect(res.body.vets[0]).to.haveOwnProperty('name');
    });
  });


  describe('GET /vets with pagination', async () => {

    const exec = (page) => {
      const perPage = 1;
      return request(server)
        .get(`/admin/vets?page=${page}&limit=${perPage}`)
        .set('Authorization', `Bearer ${token}`);
    };

    it('should return 401 if user is not an admin', async () => {
      token = regularUser.generateAuthToken();

      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body.message).to.match(/unauthorized/);
    });

    it('should return 200 and return list of vets', async () => {
      const all = await Promise.all([ exec(1), exec(2) ]);

      for (let res of all) {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('total');
        expect(res.body.total).to.be.a('number');
        expect(res.body.total).to.equal(vets.length);
      };

      expect(all[0].body.vets[0].name).to.equal(vets[0].name);
      expect(all[1].body.vets[0].name).to.equal(vets[1].name);
    });
  });


  // GET /admin/vets/:slug
  describe('GET /vets/:slug', async () => {
    afterEach(() => {
      vetHelper.clear();
    });

    // retrieve one known slug from database
    let knownSlug;
    beforeEach(async () => {
      vetHelper.populate();

      const vet = await new Vet({
        name: 'Random Vet Over Here',
        address: 'Random Addres',
        googleId: 'aaa'
      }).save();
      knownSlug = vet.slug;

      token = admin.generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .get('/admin/vets/' + knownSlug)
        .set('Authorization', `Bearer ${token}`);
    };

    it('should return 401 if user is not an admin', async () => {
      const regularUser = await new User({
        nickname: 'RegularUser',
        email: 'regular@user.net',
        password: 'RegularUserPassword'
      }).save();
      token = regularUser.generateAuthToken();

      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body.message).to.match(/unauthorized/);
    });

    it('should return 404 when invalid slug is provided', async () => {
      knownSlug = 'unknown-vet-slug';

      const res = await exec();

      expect(res.status).to.equal(404);
      expect(res.body.message).to.match(/no vet found/);
    });

    it('should return 200 when valid slug is provided', async () => {
      const res = await exec();

      expect(res.body).to.be.an('object');

      expect(res.status).to.equal(200);
    });
  });


  // GET /admin/vets/export
  describe('GET /admin/vets/export', () => {

    const exec = () => {
      return request(server)
        .get('/admin/vets/export')
        .set('Authorization', `Bearer ${token}`);
    };

    it('should return 401 if user is not an admin', async () => {
      const regularUser = await new User({
        nickname: 'RegularUser',
        email: 'regular@user.net',
        password: 'RegularUserPassword'
      }).save();
      token = regularUser.generateAuthToken();

      const res = await exec();

      expect(res.status).to.equal(401);
      expect(res.body.message).to.match(/unauthorized/);
    });

    it('should return 200 and CSV type response', async () => {
      const res = await exec();

      expect(res.type).to.equal('text');
      expect(res.message).to.be.undefined;
      expect(res.status).to.equal(200);
    });

  });
});