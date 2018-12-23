const path = require('path');
const mongoose = require('mongoose');
const async = require('async');
const { Vet } = require(path.resolve('src/models/vet'));

const vets = [
  { name: 'Abc', address: '123 St.', googleId: 'a', accepted: true },
  { name: 'Def', address: '234 St.', googleId: 'a', accepted: true },
  { name: 'Ghi', address: '345 St.', googleId: 'a', accepted: true },
  { name: 'Jkl', address: '456 St.', googleId: 'a', accepted: true },
  { name: 'Mno', address: '567 St.', googleId: 'a', accepted: true },
  { name: 'Pqr', address: '678 St.', googleId: 'a', accepted: true },
  { name: 'Stu', address: '890 St.', googleId: 'a', accepted: true },
  { name: 'Zzz Caffee', address: 'Zzz St.', googleId: 'a', accepted: true }
];

class VetHelper {
  constructor() {
    this.vets = [];
  }

  async populate() {
    await this._saveVets();
    return await Vet.find({});
  }
  
  async createOne() {
    await Vet
      .create(this.vets[0])
      .catch(err => console.error(err.message));
  }

  async clear() {
    await Vet
      .deleteMany({})
      .catch(err => console.error(err.message));
    await mongoose.connection.db.collection('_slug_ctrs')
      .deleteMany({})
      .catch(err => console.error(err.message));
  }

  async _saveVets() {
    return vets.reduce(async (previousPromise, nextVet) => {
      await previousPromise;
      return new Vet(nextVet).save();
    }, Promise.resolve());
  }
}

module.exports = VetHelper;