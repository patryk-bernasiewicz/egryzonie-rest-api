const path = require('path');
const { User } = require(path.resolve('src/models/user'));
const { Agreement } = require(path.resolve('src/models/agreement'));
const { PasswordRemind, generate } = require(path.resolve('src/models/password-remind'));


const adminPayload = {
  nickname: 'EnslavedEagle',
  email: 'test-admin@e-gryzonie.pl',
  password: 'Abcdef12345',
  signupAgreement: true
};

const userPayload = {
  nickname: 'RegularUser',
  email: 'test-user@e-gryzonie.pl',
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

  async verifyPassword(userId, password) {
    const user = await User.findOne({ _id: userId });
    return await user.validatePassword(password);
  }

  async createPasswordRemind(user) {
    const token = await PasswordRemind
      .generateToken()
      .catch(err => console.error('Generate token error!', err));
    const remind = await new PasswordRemind({ user, token, email: user.email })
      .save()
      .catch(err => console.error('Save token error!', err));
    return remind;
  }

  async retrievePasswordRemind(email) {
    return PasswordRemind.findOne({ email });
  }

  async clear() {
    await User.deleteMany({});
    await Agreement.deleteMany({});
  }
}


module.exports = AuthHelper;