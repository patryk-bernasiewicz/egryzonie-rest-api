const request = require('supertest');
const mongoose = require('mongoose');
const faker = require('faker');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const mlog = require('mocha-logger');
const config = require('config');

const { Vet } = require('../../../src/models/vet');
const { User } = require('../../../src/models/user');

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

let db;
let server;
let path;

const error = err => console.error(err.message);

const startDb = async function() {
  const dbConfig = config.get('db');
  db = await mongoose
    .connect(dbConfig, { useNewUrlParser: true })
    .catch(error);
};

const startServer = async function() {
  server = require('../../../index').listen();
  mlog.log('Server listening...');
};

const closeServer = async function() {
  await server.close();
  mlog.log('Server stopped');
};

const clearVets = async function() {
  await Vet.deleteMany({}).catch(error);
  await mongoose.connection.db.collection('_slug_ctrs').remove({}).catch(error);
  mlog.log('Vets collection cleared!');
};

const populateVets = async function() {
  await Vet.insertMany(vets).catch(error);
};


describe('ADMIN Vets integration tests', function() {
  this.timeout(15000);

  let token;
  let admin;

  before(async () => {
    startDb();
    admin = new User({
      nickname: 'EnslavedEagle',
      email: 'kontakt@patrykb.pl',
      password: 'Abcdef12345'
    });
    admin.role = 'admin';
    await admin.save();
  });


  // HTTP integration tests
  describe('Admin Vet routes', () => {
    before(startServer);
    beforeEach(() => {
      populateVets();
      token = admin.generateAuthToken();
    });

    // GET /admin/vets
    describe('GET /vets', async () => {
      const exec = () => {
        return request(server)
          .get('/admin/vets')
          .set('Authorization', `Bearer ${token}`);
      };

      it('should return 401 if no valid token is present', async () => {
        token = null;

        const res = await exec();

        expect(res.status).to.equal(401);
      });

      it('should return 200 and return list of vets', async () => {
        const res = await exec();

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(vets.length);
      });

      // TO DO: verify that we get vets
    });

    afterEach(clearVets);
    after(closeServer);
  });
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};