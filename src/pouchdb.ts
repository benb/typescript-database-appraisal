import PouchDB = require('pouchdb');
const PouchFind = require('pouchdb-find');
import * as fs from 'fs-extra-promise';
import { DBBench } from './dbbench';
import { CrossRefRecord } from './crossRefRecord';
import * as UUID from 'uuid';

declare var emit:any;

export class PouchDBBench extends DBBench {
  db: PouchDB.Database<any>;

  static get niceName() {
    return "PouchDB";
  }


  constructor(size: number) {
    super(size);
    PouchDB.plugin(PouchFind);
    this.db = new PouchDB('publications');
  }

  async prepare() {
    await this.db.destroy();
    this.db = new PouchDB('publications');
    let myIndex = {
      _id: '_design/my_index',
      views: {
        'my_index': {
          map: function (doc) {emit(doc.DOI)}.toString()
        },
        reduce: "_count"
      }
    }

    await this.db.put(myIndex);

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
    await (this.db as any).query('my_index', {stale: 'update_after'});
  }

  async getDocument(doi: string) {
    const result = await (this.db as any).query('my_index', {key: doi, include_docs: true});
    if (result.warning) {
      console.error(result.warning);
    }
    if (result.rows && result.rows.length > 0) {
      return result.rows[0].doc;
    }
    return null;
  }

  async getCount() {
     const docs = await (this.db as any).query({map: doc => emit(doc.DOI != undefined), reduce: "_count"}, {reduce: true, group: true});
     if (docs.warning) {
       console.error(docs.warning);
     }
     return docs.rows[0].value;
  }

  async performUpdates() {
    const allDocs = await this.db.allDocs({include_docs: true});
    for (let doc of allDocs.rows) {
      await this.db.put({
        _id: doc.id,
        _rev: doc.value.rev,
        publisher: doc.doc.publisher + "!"
      });
    }
  }
}
