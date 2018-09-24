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

describe('ADMIN Vets DELETE routes', function() {
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


  // DELETE /vets
  describe('DELETE /vets', async () => {
    describe('DELETE /vets/:id', async () => {
      let knownId;
      const exec = () => {
        return request(server)
          .delete('/admin/vets/' + knownId)
          .set('Authorization', `Bearer ${token}`);
      };

      it('should return 401 if user is not an admin', async () => {
        token = regularUser.generateAuthToken();

        const res = await exec();

        expect(res.status).to.equal(401);
        expect(res.body.message).to.match(/unauthorized/);
      });

      it('should delete vet', async () => {
        const res = await exec();

        expect(res.status).to.equal(200);
        
        const vet = await Vet.findById(knownId);
        expect(vet).to.be.null;
      });
    });
  });
});