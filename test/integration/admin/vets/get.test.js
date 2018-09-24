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
    testHelper.closeServer();
  });


  beforeEach(() => {
    vetHelper.populate();
    token = admin.generateAuthToken();
  });

  afterEach(() => {
    vetHelper.clear();
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
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(vetHelper.vets.length);
      expect(res.body[0]).to.be.an('object');
      expect(res.body[0]).to.haveOwnProperty('name');
      expect(res.body[0].name).to.be.a('string');
      expect(res.body[0].name).to.equal(vetHelper.vets[0].name);
    });
  });


  // GET /vets/:slug
  describe('GET /vets/:slug', async () => {
    beforeEach(() => {
      vetHelper.populate();
      token = admin.generateAuthToken();
    });

    afterEach(() => {
      vetHelper.clear();
    });

    // retrieve one known slug from database
    let knownSlug;
    beforeEach(async () => {
      const vet = await new Vet({
        name: 'Random Vet Over Here',
        address: 'Random Addres'
      }).save();
      knownSlug = vet.slug;
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

      expect(res.status).to.equal(200);
    });
  });
});