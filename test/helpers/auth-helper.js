const path = require('path');
const { User } = require(path.resolve('src/models/user'));
const { Agreement } = require(path.resolve('src/models/agreement'));


const adminPayload = {
  nickname: 'EnslavedEagle',
  email: 'kontakt@patrykb.pl',
  password: 'Abcdef12345',
  signupAgreement: true
};

const userPayload = {
  nickname: 'RegularUser',
  email: 'regular@user.net',
  password: 'Fedcba54321',
  signupAgreement: true
};


class AuthHelper {
  constructor() {
    this.adminPayload = adminPayload;
    this.userPayload = userPayload;
  }

  async createAdmin() {
    const admin = new User(this.adminPayload);
    admin.role = 'admin';
    await admin.save();

    await new Agreement({ agreement: 'signup', user: admin }).save();

    return admin;
  }

  async createUser() {
    const user = new User(this.userPayload);
    await user.save();

    const agreement = new Agreement({ agreement: 'signup', user: user }).save();

    return user;
  }

  async clear() {
    await User.deleteMany({});
    await Agreement.deleteMany({});
  }
}


module.exports = AuthHelper;