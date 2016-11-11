import * as pouch from 'pouchdb';
import * as fs from 'fs-extra-promise';
import { CrossRefRecord } from './crossRefRecord';
import * as Temp from 'temp'
import { take } from 'lodash';

Temp.track();
interface TestData {
  crossrefData: [any];
}


function fyShuffle (array:any[]) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export abstract class DBBench {
  data: TestData;
  size; number;
  tempDir: string;
  
  constructor(size: number) {
    this.size = size;
    this.tempDir = Temp.mkdirSync('dbbench');
  }

  async readPapermill() {
    this.data = JSON.parse(await fs.readFileAsync('testData.json', 'utf8'))
  }

  abstract async prepare();
  abstract async cleanup();
  abstract async loadDB();
  abstract async getCount();
  abstract async getDocument(doi: string);

  async queries() {
    const dois = take(this.data.crossrefData, this.size).map(x => x.DOI);
    fyShuffle(dois);
    for (let doi of dois) {
      await this.getDocument(doi);
    }
  }

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
    console.time('queries');
    await this.queries();
    console.timeEnd('queries');
    console.log("COUNT", count);
  }

}
