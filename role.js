const { User } = require('./src/models/user');
const jwt = require('jsonwebtoken');

const user = new User({
  nickname: 'EnslavedEagle',
  email: 'kontakt@patrykb.pl',
  password: 'Abcdef12345'
});
const token = user.generateAuthToken();

console.log(jwt.decode(token));