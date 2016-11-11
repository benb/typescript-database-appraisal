import PouchDB = require('pouchdb');
import * as fs from 'fs-extra-promise';
import { DBBench } from './main';
import { CrossRefRecord } from './crossRefRecord';
import * as UUID from 'uuid';


export class PouchDBBench extends DBBench {
  db: PouchDB.Database<CrossRefRecord>;

  constructor(size: number) {
    super(size);
    this.db = new PouchDB('publications');
  }

  async prepare() {
    await this.db.destroy();
    this.db = new PouchDB('publications');
  }

  async loadDB() {
    let c = 0;
    for (let item of this.data.crossrefData) {
      item._id = UUID.v1();
      await this.db.put(item);
      c++;
      if (c >= this.size) {
        break
      }
    }
  }

  async getCount() {
     const docs = await this.db.allDocs();
     return docs.total_rows;
  }
}
