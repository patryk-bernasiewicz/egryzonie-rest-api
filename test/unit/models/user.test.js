const { describe, it, beforeEach } = require('mocha');
const { User, userSchema } = require('../../../src/models/user');
const chai = require('chai');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const sinon = require('sinon');

const expect = chai.expect;

let payload;

describe('User Model', () => {
  beforeEach(() => {
    payload = {
      _id: mongoose.Types.ObjectId().toHexString(),
      nickname: 'EnslavedEagle92',
      email: 'kontakt@patrykb.pl',
      password: '1234abcDEF'
    };
  });

  describe('User fields validation', () => {

    const exec = (payload) => {
      return new User(payload).validateSync();
    };

    it('should reject invalid payload', () => {
      payload.nickname = '##EnslavedEagle';
      
      const validate = exec(payload);

      expect(validate).to.have.property('errors');
      expect(validate.errors).to.not.be.empty;
      expect(validate.errors).to.have.property('nickname');
    });

    it('should be okay if payload is valid', () => {
      const validate = exec(payload);
      
      expect(validate).to.be.undefined;
    });
  });

  describe('User.methods.generateAuthToken()', () => {
    it('generates valid JWT Token', () => {
      const token = new User(payload).generateAuthToken();
      
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

      expect(decoded).to.haveOwnProperty('_id');
      expect(decoded).to.haveOwnProperty('role');
      expect(decoded._id).to.equal(payload._id);
      expect(decoded.role).to.equal('user');
    });
  });

  describe('User._middleware.hashPassword()', () => {
    it('should hash the password before saving', async () => {
      const ctx = _.clone(payload);
      const bound = _.bind(userSchema._middleware.hashPassword, ctx);
      await bound();
      
      expect(ctx.password).to.match(/^\$2[ayb]\$.{56}$/);
    });
  });
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};