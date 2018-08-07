const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const { Vet } = require('../../../src/models/vet');
const mongoose = require('mongoose');

let payload;

describe('Vet fields validation', () => {
  beforeEach(() => {
    payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      position: { type: 'Point', coordinates: [ -69.12345, -96.54321 ] },
      slug: 'centrum-zdrowia-malych-zwierzat',
      name: 'Centrum Zdrowia Małych Zwierząt',
      address: 'Wronki, ul. Poznańska 39',
      rodents: true,
      exoticAnimals: true,
      websiteUrl: 'http://centrumwet.pl',
      phone: '123 456 789',
      accepted: true
    };
  });

  const exec = (payload) => {
    return new Vet(payload).validateSync();
  };

  it('should reject invalid position', () => {
    payload.position = { type: 'Point', coordinates: [ -900, -1000 ] };

    const validate = exec(payload);
    expect(validate.errors).to.haveOwnProperty('position');
    expect(validate.errors.position.message).to.match(/invalid position/);
  });

  it('should reject invalid slug', () => {
    payload.slug = 'centrum Zdrowia malych';

    const validate = exec(payload);
    expect(validate.errors).to.haveOwnProperty('slug');
    expect(validate.errors.slug.message).to.match(/invalid slug/);
  });

  it('should reject invaliid name', () => {
    payload.name = '#!@%!@%!@';

    const validate = exec(payload);
    expect(validate.errors).to.haveOwnProperty('name');
    expect(validate.errors.name.message).to.match(/invalid name/);
  });

  it('should be ok if payload is valid', () => {
    const validate = exec(payload);

    expect(validate).to.be.undefined;
  });
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};