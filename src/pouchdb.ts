import PouchDB = require('pouchdb');
import { Papermill } from '@readcube/api-client';
import * as fs from 'fs-extra-promise';
import { DBBench, PapermillJSON } from './main';


export class PouchDBBench extends DBBench {
  db: PouchDB.Database<Papermill.Publication>;

  constructor() {
    super();
    this.db = new PouchDB('publications');
  }

  async prepare() {
    await this.db.destroy();
    this.db = new PouchDB('publications');
  }

  async loadDB() {
    for (let uuid in this.papermill.publications) {
      const pub:any = this.papermill.publications[uuid];
      pub._id = pub.uuid;
      await this.db.put(pub);
    }
  }

  async getCount() {
     const docs = await this.db.allDocs();
     return docs.total_rows;
  }
}
