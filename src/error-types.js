class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = 'Assertion Error';
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
    this.name = 'Authorization Error';
  }
}


exports.AssertionError = AssertionError;
exports.AuthorizationError = AuthorizationError;
