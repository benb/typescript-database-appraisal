import * as pouch from 'pouchdb';
import * as fs from 'fs-extra-promise';
import { CrossRefRecord } from './crossRefRecord';

interface TestData {
  crossrefData: [any];
}

export abstract class DBBench {
  data: TestData;
  size; number;
  
  constructor(size: number) {
    this.size = size;
  }

  async readPapermill() {
    this.data = JSON.parse(await fs.readFileAsync('testData.json', 'utf8'))
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
