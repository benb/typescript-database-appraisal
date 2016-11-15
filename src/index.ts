import { PouchDBBench } from './pouchdb';
import { SQLiteRaw } from './sqlitedb_raw';
import { NeDBBench } from './nedb';
import { TypeORM } from './sqlitedb_typeorm';
import { DBBench } from './dbbench';
import { SequelizeBench } from './sqlitedb_sequelize';
import * as fs from 'fs-extra-promise';

async function runBenchmarks() {
  const resultObj: any = {};
  for (let dbClass of [NeDBBench, SequelizeBench, TypeORM, SQLiteRaw, PouchDBBench]) {
    resultObj[dbClass.niceName] = {} as any;
    const reps = [];
    for (let i=1000; i < 10000; i*=2) {
      reps.push(i);
    }
    reps.push(10000);
    for (let count of reps) {
      console.log();
      console.log("=====", dbClass.niceName, count, "=====");
      let bench = new dbClass(count);
      try {
        const result = await bench.benchmark();
        for (let field in result) {
          if (!resultObj[dbClass.niceName][field]) {
            resultObj[dbClass.niceName][field] = [];
          }
          resultObj[dbClass.niceName][field].push( {size: count, time: result[field]});
        }
      } catch(err) {
        console.error(err);
      }
      console.log("=====", dbClass.niceName, count, "=====");
      console.log();
    }
  }
  return resultObj;
}

runBenchmarks().then( (result) => {
  console.log("Finished");
  fs.writeFile('results.json', JSON.stringify(result));
});
