import 'reflect-metadata';
import { createConnection, Connection, ConnectionOptions } from 'typeorm';
import * as fs from 'fs-extra-promise';
import { DBBench } from './dbbench';
import { CrossRefSQLRecord, CrossRefRecord } from './crossRefRecord';

export class TypeORM extends DBBench {
  db: Connection;

  constructor(size: number) {
    super(size);
  }

  static get niceName() {
    return "SQLite/TypeORM";
  }

  async prepare() {
    const options: ConnectionOptions = {
      driver: {
        type: "sqlite",
        storage: this.tempDir + "/sqlite.db"
      }, 
      entities: [
        CrossRefSQLRecord
      ],
      autoSchemaSync: true
    };
    this.db = await createConnection(options);
  }


  async cleanup() {
    return this.db.close();
  }

  async loadDB() {
    let c = 0;
    const repository = this.db.getRepository(CrossRefSQLRecord);
    return repository.transaction(async (repository) => {
      for (let c = 0; c < this.size; c++) {
        const item = this.data.crossrefData[c];
        const record = new CrossRefSQLRecord(item);
        await repository.persist(record);
      }
    });
  }

  async getDocument(doi: string) {
    const result = await this.db.getRepository(CrossRefSQLRecord).find({DOI: doi});
    if (result && result.length > 0) {
      return result[0];
    }
  }

  async getCount() {
    let [items, count] = await this.db.getRepository(CrossRefSQLRecord).findAndCount()
    return count;
  }

  async performUpdates() {
    const repository = this.db.getRepository(CrossRefSQLRecord);
    const data = await repository.find();
    for (let record of data) {
      record.publisher = record.publisher + "!";
      await repository.persist(record);
    }
  }
}
