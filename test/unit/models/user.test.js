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

    it('should reject invalid nickname', () => {
      payload.nickname = '##EnslavedEagle';
      
      const validate = exec(payload);

      expect(validate).to.not.be.undefined;
      expect(validate.errors).to.haveOwnProperty('nickname');
      expect(validate.errors.nickname.message).to.match(/invalid nickname/);
    });

    it('should reject invalid email', () => {
      payload.email = 'invalid!@#email@gmail.com';

      const validate = exec(payload);

      expect(validate).to.not.be.undefined;
      expect(validate.errors).to.haveOwnProperty('email');
      expect(validate.errors.email.message).to.match(/invalid email/);
    });

    it('should reject invalid password', () => {
      payload.password = '1';

      const validate = exec(payload);

      expect(validate).to.not.be.undefined;
      expect(validate.errors).to.haveOwnProperty('password');
      expect(validate.errors.password.message).to.match(/is shorter than the minimum/);
    });

    it('should reject invalid role', () => {
      payload.role = 'supersuperadmin';

      const validate = exec(payload);

      expect(validate).to.not.be.undefined;
      expect(validate.errors).to.haveOwnProperty('role');
      expect(validate.errors.role.message).to.match(/is not a valid enum value/);
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

  describe('User pre-save hook: hash password', () => {
    it('should hash the password before saving', async () => {
      let ctx = _.clone(payload);
      const spy = sinon.spy();

      const bound = _.bind(userSchema._middleware.hashPassword, ctx);
      await bound(spy);

      const decoded = await bcrypt.compare(payload.password, ctx.password);
      
      sinon.assert.calledOnce(spy);
      expect(decoded).to.be.true;
    });
  });
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};