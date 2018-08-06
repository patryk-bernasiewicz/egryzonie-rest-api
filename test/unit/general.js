const { describe, it } = require('mocha');
const { expect } = require('chai');

describe('General tests', () => {
  it('should be valid', () => {
    expect(2+2).to.equal(4);
  });
});