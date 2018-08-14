const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const { Vet } = require('../../../src/models/vet');
const { User } = require('../../../src/models/user');
const mongoose = require('mongoose');

let payload;

describe('Vet Model', () => {
  beforeEach(() => {
    payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      position: { type: 'Point', coordinates: [ -69.12345, -96.54321 ] },
      name: 'Centrum Zdrowia Małych Zwierząt',
      address: 'Wronki, ul. Poznańska 39',
      rodents: true,
      exoticAnimals: true,
      websiteUrl: 'http://centrumwet.pl',
      phone: '123 456 789',
      accepted: true,
      acceptedBy: { _id: mongoose.Types.ObjectId() },
      acceptedDate: Date.now()
    };
  });

  describe('Vet fields validation', () => {
    const exec = (payload) => {
      return new Vet(payload).validateSync();
    };

    it('should reject invalid position', () => {
      payload.position = { type: 'Point', coordinates: [ -900, -1000 ] };

      const validate = exec(payload);
      expect(validate).to.not.be.undefined;
      expect(validate.errors).to.haveOwnProperty('position');
      expect(validate.errors.position.message).to.match(/invalid position/);
    });

    // it('should reject invalid slug', () => {
    //   payload.slug = 'centrum Zdrowia malych';

    //   const validate = exec(payload);
    //   expect(validate).to.not.be.undefined;
    //   expect(validate.errors).to.haveOwnProperty('slug');
    //   expect(validate.errors.slug.message).to.match(/invalid slug/);
    // });

    it('should reject invalid name', () => {
      payload.name = '#!@%!@%!@';

      const validate = exec(payload);
      expect(validate).to.not.be.undefined;
      expect(validate.errors).to.haveOwnProperty('name');
      expect(validate.errors.name.message).to.match(/invalid name/);
    });

    it('should be ok if payload is valid', () => {
      const validate = exec(payload);

      expect(validate).to.be.undefined;
    });
  });

  describe('Relationships', () => {
    it('should have an acceptedBy field that references a User', () => {
      payload.acceptedBy = new User({ _id: mongoose.Types.ObjectId(), nickname: 'EnslavedEagle' });
      const vet = new Vet(payload);

      expect(vet.acceptedBy).to.be.an('object');
      expect(mongoose.Types.ObjectId.isValid(vet.acceptedBy.id)).to.be.true;
    });
  });
  
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};