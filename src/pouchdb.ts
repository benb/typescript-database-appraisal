import PouchDB = require('pouchdb');
const PouchFind = require('pouchdb-find');
import * as fs from 'fs-extra-promise';
import { DBBench } from './dbbench';
import { CrossRefRecord } from './crossRefRecord';
import * as UUID from 'uuid';

export class PouchDBBench extends DBBench {
  db: PouchDB.Database<CrossRefRecord>;

  constructor(size: number) {
    super(size);
    PouchDB.plugin(PouchFind);
    this.db = new PouchDB('publications');
  }

  async prepare() {
    await this.db.destroy();
    this.db = new PouchDB('publications');
    const db:any = this.db;
    await db.createIndex({
      index: {
        fields: ['DOI']
      }
    });

    return;
  }


  async cleanup() {
    await this.db.destroy();
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

  async getDocument(doi: string) {
    const result = await (this.db as any).find({selector: {"DOI": doi}, limit: 1}); 
    if (result.warning) {
      console.error(result.warning);
    }
    if (result.docs && result.docs.length > 0) {
      return result.docs[0];
    }
    return null;
  }

  async getCount() {
    //this apparently isn't using the index
    //probably related to http://stackoverflow.com/questions/38497985/pouchdb-find-why-is-my-index-not-used
     const docs = await (this.db as any).find({selector: {"DOI": {"$exists": true}}});
     if (docs.warning) {
       console.error(docs.warning);
     }
     return docs.docs.length;
  }
}
