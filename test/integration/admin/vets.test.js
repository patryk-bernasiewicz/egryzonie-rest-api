const request = require('supertest');
const mongoose = require('mongoose');
const faker = require('faker');
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const config = require('config');
const momentizer = require('../../momentizer');
const log = require('../../test-log');

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

const startDb = async function() {
  const dbConfig = config.get('db');
  db = await mongoose
    .connect(dbConfig, { useNewUrlParser: true })
    .catch(log);
};

const startServer = async function() {
  server = require('../../../index').listen();
  log('Server listening...');
};

const closeServer = async function() {
  await server.close();
  log('Server stopped');
};

const clearVets = async function() {
  await Vet.deleteMany({}).catch(log);
  await mongoose.connection.db.collection('_slug_ctrs').remove({}).catch(log);
  log('Vets collection cleared!');
};

const populateVets = async function() {
  await Vet.insertMany(vets).catch(log);
  log('Vets collection populated!');
};


describe('ADMIN Vets integration tests', function() {
  momentizer();

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

      it('should return 200 and return list of vets', async () => {
        const res = await exec();

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(vets.length);
      });
    });


    // GET /vets/:slug
    describe('GET /vets/:slug', async () => {

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


    // POST /vets
    describe('POST /vets', async () => {
      let payload;
      beforeEach(() => {
        payload = {
          position: [-39.987654, 39.456789],
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
      
    });

    afterEach(clearVets);
    after(closeServer);
  });
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};