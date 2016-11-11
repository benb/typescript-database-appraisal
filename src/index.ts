import { PouchDBBench } from './pouchdb';
import { NeDBBench } from './nedb';
import { DBBench } from './main';

async function runBenchmarks() {
  for (let count of [100, 1000, 10000]) {
    for (let dbClass of [PouchDBBench, NeDBBench]) {
      console.log();
      console.log("=====", dbClass.name, count, "=====");
      let bench = new dbClass(count);
      try {
        await bench.benchmark();
      } catch(err) {
          console.error(err);
      }
      console.log("=====", dbClass.name, count, "=====");
      console.log();
    }
  }
}

runBenchmarks().then( () => {
  console.log("Finished");
});
