const { AssertionError, DatabaseError, AuthorizationError, NotFoundError, InternalError } = require('../error-types');

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