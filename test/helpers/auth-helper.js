const path = require('path');
const { User } = require(path.resolve('src/models/user'));


const adminPayload = {
  nickname: 'EnslavedEagle',
  email: 'kontakt@patrykb.pl',
  password: 'Abcdef12345'
};

const userPayload = {
  nickname: 'RegularUser',
  email: 'regular@user.net',
  password: 'Fedcba54321'
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

    return admin;
  }

  async createUser() {
    const user = new User(this.userPayload);
    await user.save();

    return user;
  }
}


module.exports = AuthHelper;