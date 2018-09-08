exports.AssertionError = class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = 'Validation Error';
  }
};

exports.DatabaseError = class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
    this.name = 'Database Error';
  }
};

exports.AuthorizationError = class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
    this.name = 'Authorization Error';
  }
};
