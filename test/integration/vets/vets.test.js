const request = require('supertest');
const mongoose = require('mongoose');
const faker = require('faker');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const mlog = require('mocha-logger');
const config = require('config');

const { Vet } = require('../../../src/models/vet');

let db;
let server;
let path;

const error = err => console.error(err.message);

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


describe('Vet integration tests', async function() {
  this.timeout(15000);

  before(startDb);
  beforeEach(clearVets);

  // General integration tests with models
  describe('Vet model behavior', function() {
    const payload = [
      { name: 'Abc', address: '123 St.' },
      { name: 'Abc', address: '321 St.' },
      { name: 'Abc', address: '456 St.' }
    ];

    it('should generate new Vet without problem', async () => {
      const vet = await new Vet(payload[0]).save();

      expect(vet).to.not.be.null;
    });

    it('should generate valid slugs when multiple data is present', async () => {
      await new Vet(payload[0]).save();
      await new Vet(payload[1]).save();
      await new Vet(payload[2]).save();
    
      const vets = await Vet.find({});

      expect(vets).to.be.an('array');
      expect(vets.length).to.equal(3);
      expect(vets[0].slug).to.match(/^abc$/);
      expect(vets[1].slug).to.match(/^abc-2$/);
      expect(vets[2].slug).to.match(/^abc-3$/);
    });
  });


  // HTTP integration tests
  describe('Vet routes', function () {
    this.timeout(15000);

    before(startServer);

    describe('GET /vets', function () {
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

    });

    after(closeServer);
  });
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};