const path = require('path');
const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const { Vet, validateVet } = require(path.resolve('src/models/vet'));
const { User } = require(path.resolve('src/models/user'));
const mongoose = require('mongoose');

let payload;
let smallPayload;

describe('Vet Model', () => {
  beforeEach(() => {
    payload = {
      position: { type: 'Point', coordinates: [ -69.12345, -55.54321 ] },
      name: 'Centrum Zdrowia Małych Zwierząt',
      address: 'Wronki, ul. Poznańska 39',
      rodents: true,
      exoticAnimals: true,
      websiteUrl: 'http://centrumwet.pl',
      phone: '123 456 789'
    };
  });

  describe('Vet validator', () => {
    const exec = (payload) => {
      return validateVet(payload);
    };

    
    describe('return of valid values', () => {
      it('should return null if payload is valid', () => {
        const result = exec(payload);
        expect(result).to.have.property('error');
        expect(result.error).to.be.null;
        expect(result).to.have.property('value');
        expect(result.value).to.be.an('object');
      });

      it('should return an error if payload is invalid', () => {
        payload.name = null;
        const result = exec(payload);
        expect(result).to.have.property('error');
        expect(result.error).to.not.be.null;
        expect(result.error).to.have.property('message');
        expect(result.error.message).to.be.a('string');
        expect(result.error.message.length).to.be.greaterThan(0);
      });
    });


    describe('invalid payload items', () => {
      it('should reject invalid name', () => {
        payload.name = '#!@%!@%!@';
  
        const { error } = exec(payload);
        expect(error.message).to.match(/invalid name/i);
      });
  
  
      it('should reject invalid coordinates', () => {
        payload.position = {
          type: 'Point',
          coordinates: [ 199, 500 ]
        };
  
        const { error } = exec(payload);
        expect(error.message).to.match(/invalid position/i);
      });
  
  
      it('should reject invalid address', () => {
        payload.address = '';
  
        const { error } = exec(payload);
        expect(error.message).to.match(/invalid address/i);
      });
  
  
      it('should reject invalid rodents value', () => {
        payload.rodents = 'abc';
  
        const { error } = exec(payload);
        expect(error.message).to.match(/invalid rodents/i);
      });
  
  
      it('should reject invalid exotic animals value', () => {
        payload.exoticAnimals = 'abc';
  
        const { error } = exec(payload);
        expect(error.message).to.match(/invalid exotic animals/i);
      });
  
  
      it('should reject invalid website url', () => {
        payload.websiteUrl = 'ftp://goo.gl';
  
        const { error } = exec(payload);
        expect(error.message).to.match(/invalid website url/i);
      });

  
      it('should reject invalid phone number', () => {
        payload.phone = 129999;
  
        const { error } = exec(payload);
        expect(error.message).to.match(/invalid phone number/i);
      });
    });


    describe('valid payload items', () => {
      it('should be ok if payload is valid', () => {
        const { error } = exec(payload);
        expect(error).to.be.null;
      });

      it('should be okay if payload is minimal', () => {
        payload = smallPayload;
        const { error } = exec(payload);
        expect(error).to.be.null;
      });
    })

  });

  describe('Relationships', () => {
    it('should have an acceptedBy field that references a User', () => {
      payload.acceptedBy = new User({ _id: mongoose.Types.ObjectId(), nickname: 'EnslavedEagle', role: 'admin' });
      const vet = new Vet(payload);

      expect(vet.acceptedBy).to.be.an('object');
      expect(vet.acceptedBy).to.have.property('_id');
      expect(mongoose.Types.ObjectId.isValid(vet.acceptedBy._id)).to.be.true;
      expect(vet.acceptedBy).to.have.property('nickname');
      expect(vet.acceptedBy.nickname).to.equal('EnslavedEagle');
      expect(vet.acceptedBy).to.have.property('role');
      expect(vet.acceptedBy.role).to.equal('admin');
    });
  });
  
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};