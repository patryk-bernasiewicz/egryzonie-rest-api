const path = require('path');
const mongoose = require('mongoose');
const { Vet } = require('../../src/models/vet');

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
  async populate() {
    await Vet.insertMany(vets).catch(err => console.error(err.message));
  }

  async clear() {
    await Vet.deleteMany({}).catch(err => console.error(err.message));
    await mongoose.connection.db.collection('_slug_ctrs').remove({}).catch(console.log);
  }
}

module.exports = VetHelper;