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
  let knownVet;

  before(async () => {
    testHelper.startDb();
    testHelper.startServer();
    server = testHelper.server;

    admin = await authHelper.createAdmin();
    regularUser = await authHelper.createUser();
    await vetHelper.populate();

    knownVet = await Vet.findOne({}).catch(err => console.error(err));
  });


  beforeEach(() => {
    token = admin.generateAuthToken();
  });


  after(() => {
    // Clear mongoose models so that mocha's --watch works
    mongoose.models = {};
    mongoose.modelSchemas = {};
    vetHelper.clear();
    testHelper.closeServer();
  });


  // DELETE /vets
  describe('DELETE /vets', async () => {
    describe('DELETE /vets/:id', async () => {
      const exec = () => {
        return request(server)
          .delete('/admin/vets/' + knownVet._id)
          .set('Authorization', `Bearer ${token}`);
      };

      it('should return 401 if user is not an admin', async () => {
        token = regularUser.generateAuthToken();

        const res = await exec();

        expect(res.status).to.equal(401);
        expect(res.body.message).to.match(/unauthorized/);
      });

      it('should delete vet and return its data in response', async () => {
        const res = await exec();

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('vet');
        expect(res.body.vet).to.be.an('object');
        expect(res.body.vet).to.have.property('name');
        expect(res.body.vet.name).to.equal(vetHelper.vets[0].name);

        const vet2 = await Vet.findById(knownVet._id);
        expect(vet2).to.be.null;
      });
    });
  });
});