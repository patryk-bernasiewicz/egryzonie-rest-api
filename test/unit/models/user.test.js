const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');
const { User } = require('../../../src/models/user');
const mongoose = require('mongoose');

let payload;

describe('User Model', () => {
  describe('User fields validation', () => {
    beforeEach(() => {
      payload = {
        nickname: 'EnslavedEagle92',
        email: 'kontakt@patrykb.pl',
        password: '1234abcDEF'
      };
    });

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
});

// Clear mongoose models so that mocha's --watch works
mongoose.models = {};
mongoose.modelSchemas = {};