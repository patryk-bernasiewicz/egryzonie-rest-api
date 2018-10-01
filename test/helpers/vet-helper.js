const path = require('path');
const mongoose = require('mongoose');
const async = require('async');
const { Vet } = require(path.resolve('src/models/vet'));

const vets = [
  { name: 'Abc', address: '123 St.' },
  { name: 'Def', address: '234 St.' },
  { name: 'Ghi', address: '345 St.' },
  { name: 'Jkl', address: '456 St.' },
  { name: 'Mno', address: '567 St.' },
  { name: 'Pqr', address: '678 St.' },
  { name: 'Stu', address: '890 St.' },
  { name: 'Zzz Caffee', address: 'Zzz St.' }
];

class VetHelper {
  constructor() {
    this.vets = [];
  }

  async populate() {
    return new Promise((resolve, reject) => {
      async.each(vets, this._save.bind(this), err => {
        if (err) reject(err);
        this.vets.sort((a, b) => a.name > b.name);
        resolve(this.vets);
      });
    });
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
      .remove({})
      .catch(err => console.error(err.message));
  }

  // private methods
  async _save(vet) {
    const savedVet = await new Vet(vet).save().catch(err => console.error(err.message));
    this.vets.push(savedVet);
  }
}

module.exports = VetHelper;