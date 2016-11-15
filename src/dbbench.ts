import * as pouch from 'pouchdb';
import * as fs from 'fs-extra-promise';
import { CrossRefRecord } from './crossRefRecord';
import * as Temp from 'temp'
import { take } from 'lodash';

//Temp.track();
interface TestData {
  crossrefData: [any];
}


function fyShuffle (array:any[]) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const timePromise = async(p: (() => Promise<any>)) => {
  const start = process.hrtime();
  const foo = await p();
  const timeTaken = process.hrtime(start);
  return timeTaken[0] * 1e3 + timeTaken[1] / 1e6;
}

export abstract class DBBench {
  data: TestData;
  size; number;
  tempDir: string;
  get niceName() {
    return "generic DB";
  }
  
  constructor(size: number) {
    this.size = size;
    this.tempDir = Temp.mkdirSync('dbbench');
  }

  abstract async prepare();
  abstract async cleanup();
  abstract async loadDB();
  abstract async getCount();
  abstract async performUpdates();
  abstract async getDocument(doi: string);

  async readSampleData() {
    this.data = JSON.parse(await fs.readFileAsync('testData.json', 'utf8'))
  }

  async queries() {
    const dois = take(this.data.crossrefData, this.size).map(x => x.DOI);
    fyShuffle(dois);
    for (let doi of dois) {
      const doc = await this.getDocument(doi);
      if (doc.DOI != doi) {
        console.error("weird non-match: ", doc.DOI, doi, doc);
      }
    }
  }

  async benchmark() { 
    let c = 0;
    await this.prepare();
    await this.readSampleData();

    const result: any = {};

    result.loadTime = await timePromise(() => {return this.loadDB()});

    result.countTime = await timePromise(async () => {
      const c = await this.getCount()
      if (c != this.size) {
        console.log(`Sanity check failed, expected ${this.size} rows but got ${c}.`);
      }
    });

    result.queryTime = await timePromise(() => {return this.queries()});

    result.updateTime = await timePromise(() => {return this.performUpdates()});

    //TODO: 
    // author search
    // full-text search


    console.log(result);

    await this.cleanup();
    
    return result;
  }

}
