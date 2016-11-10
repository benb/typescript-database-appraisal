import { PouchDBBench } from './pouchdb';
import { DBBench } from './main';

let pouchDBBench = new PouchDBBench();
pouchDBBench.benchmark().then( () => {
  console.log("DONE");
}).catch(err => {
  console.error(err);
});

