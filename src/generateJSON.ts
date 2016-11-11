import * as request from 'request-promise';
import * as fs from 'fs-extra-promise';
const OnDeath = require('death');

async function sleep(time: number) {
  return new Promise((resolve) => {setTimeout(resolve, time)});
}

async function generateJSON(count: number) {
  const items = new Set<any>(); 

  OnDeath(function(signal, err) {
    save(Array.from(items)).then( () => {;
       process.exit(1);
    });
  });

  while (items.size < count) {
    console.log(items.size, count);
    const reqSize = Math.min(count - items.size, 100);
    const result = await request.get({
      uri: 'http://api.crossref.org/works',
      qs: {
        sample: reqSize
      },
      json: true
    });
    console.log(`Downloaded ${reqSize} items from CrossRef`);

    for (let item of result.message.items) {
      items.add(item);
    }

    if (items.size < count) {
      sleep(250);
    }
  }
  return Array.from(items);
}

const count = parseInt(process.argv[2]);

async function save(items) {
    let existing: {[key: string]: any} = {};
    try {
      const data = await fs.readFileAsync('testData.json', 'utf8');
      existing = JSON.parse(data);
    } catch (error) {
      console.error('WARNING', error);
    }
    const uniqueEntries = new Set((existing['crossrefData'] || []).concat(items));
    existing['crossrefData'] = Array.from(uniqueEntries);

    await fs.writeFileAsync('testData.json', JSON.stringify(existing));
    console.log("Saved", items.length, "new items", "total now", existing['crossrefData'].length);
    return;
}

generateJSON(count).then(save);
