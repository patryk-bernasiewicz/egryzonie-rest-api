module.exports = (err) => {
  if (process.env.TEST_DEBUG === true) {
    console.log(err.message);
  }
};
