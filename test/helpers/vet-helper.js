const path = require('path');
const mongoose = require('mongoose');
const { Vet } = require(path.resolve('src/models/vet'));

class VetHelper {
  constructor() {
    this.payload = [
      { name: 'Abc', address: '123 St.', googleId: 'abc', accepted: true },
      { name: 'Def', address: '234 St.', googleId: 'def', accepted: true },
      { name: 'Ghi', address: '345 St.', googleId: 'ghi', accepted: true },
      { name: 'Jkl', address: '456 St.', googleId: 'jkl', accepted: true },
      { name: 'Mno', address: '567 St.', googleId: 'mno', accepted: true },
      { name: 'Pqr', address: '678 St.', googleId: 'pqr', accepted: true },
      { name: 'Stu', address: '890 St.', googleId: 'stu', accepted: true },
      {
        name: 'Zzz Caffee',
        address: 'Zzz St.',
        googleId: 'zzz',
        accepted: true
      }
    ];
    this.vets = [];
  }

  async populate() {
    await this._saveVets();
    return await Vet.find({});
  }

  async createOne() {
    await Vet.create(this.vets[0]).catch(err => console.error(err.message));
  }

  async clear() {
    await Vet.deleteMany({}).catch(err => console.error(err.message));
    await mongoose.connection.db
      .collection('_slug_ctrs')
      .deleteMany({})
      .catch(err => console.error(err.message));
  }

  async _saveVets() {
    return this.payload.reduce(async (previousPromise, nextVet) => {
      await previousPromise;
      return new Vet(nextVet).save();
    }, Promise.resolve());
  }
}

module.exports = VetHelper;
