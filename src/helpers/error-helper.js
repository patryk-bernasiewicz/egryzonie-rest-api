class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = 'Assertion Error';
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
    this.name = 'Database Error';
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
    this.name = 'Authorization Error';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'Not Found Error';
  }
}

class InternalError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
    this.name = 'Internal Error';
  }
}

const helper = {
  assertion: (err) => {
    throw new AssertionError(`Invalid payload: ${err.message}`);
  },
  database: (err) => {
    throw new DatabaseError(`Database error: ${err.message}`);
  },
  authorization: (err) => {
    throw new AuthorizationError(`Unauthorized: ${err.message}`);
  },
  notFound: (err) => {
    throw new NotFoundError(`Not found: ${err.message}`);
  },
  internal: (err) => {
    throw new InternalError(`Internal Error: ${err.message}`);
  }
};

module.exports = helper;