import * as Datastore from 'nedb';
import { promisify } from 'bluebird';
import * as fs from 'fs-extra-promise';
import { DBBench } from './dbbench';
import { CrossRefRecord } from './crossRefRecord';
import * as UUID from 'uuid';


export class NeDBBench extends DBBench {
  db: Datastore;

  constructor(size: number) {
    super(size);
    console.log(this.tempDir + '/nedb');
    this.db = new Datastore(this.tempDir + '/nedb');
  }

  async prepare() {
    await new Promise( (resolve, reject) => {
      this.db.loadDatabase((err) => {
        if (err) {
          reject(err);
        } else {
          this.db.ensureIndex({ fieldName: 'DOI', unique: true } , function (err) {
            if (err) { reject(err); }
            else { resolve(); }
          });
        }
      });
    });
  }

  async cleanup() {
  }

  async insertItem(item: CrossRefRecord) {
      const p = new Promise( (resolve, reject) => {
        this.db.insert(item, function(err, newItem) {
          if (err) {reject(err)}
          else {resolve(newItem)};
        });
      });
      return p;
  }

  async loadDB() {
    let c = 0;
    for (let item of this.data.crossrefData) {
      await this.insertItem(item);
      c++;
      if (c >= this.size) {
        break
      }
    }
  }

  async getDocument(doi: string) {
    return new Promise( (resolve, reject) => {
      this.db.find({'DOI': doi}).limit(1).exec(function( err, docs) {
        if (err) { reject(err) }
        else { resolve(docs[0]) }
      });
    });
  }

  async getCount() {
    return new Promise( (resolve, reject) => {
      this.db.count({}, function(err, c) {
        if (err) { reject(err); }
        else { resolve(c); }
      });
    });
  }
}
