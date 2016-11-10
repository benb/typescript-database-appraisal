import * as pouch from 'pouchdb';
import * as fs from 'fs-extra-promise';
import { Papermill } from '@readcube/api-client';

export interface PapermillJSON {
  publications: {[uuid: string]: Papermill.Publication};
  collections: [Papermill.Collection];
}

export abstract class DBBench {
  papermill: PapermillJSON;

  async readPapermill() {
    this.papermill = JSON.parse(await fs.readFileAsync('archive.papermill', 'utf8'))
  }

  abstract async prepare();
  abstract async loadDB();
  abstract async getCount();

  async benchmark() { 
    let c = 0;
    await this.prepare();
    await this.readPapermill();
    console.time('load');
    await this.loadDB();
    console.timeEnd('load');
    console.time('count');
    const count = await this.getCount();
    console.timeEnd('count');
    console.log("COUNT", count);
  }

}
