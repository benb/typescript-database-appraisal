import * as fs from 'fs-extra-promise';
import * as sqlite from 'sqlite3';
import { DBBench } from './dbbench';
import { CrossRefSQLRecord, CrossRefRecord } from './crossRefRecord';

export class SQLiteRaw extends DBBench {
  db: sqlite.Database;
  cols = ['indexed', 'reference-count', 'publisher', 'issue', 'content-domain', 'short-container-title', 'published-print', 'DOI', 'type', 'created', 'page', 'source', 'title', 'prefix', 'volume', 'author', 'member', 'published-online', 'container-title', 'original-title', 'deposited', 'score', 'subtitle', 'short-title', 'issued', 'URL', 'ISSN', 'subject', 'license', 'link', 'alternative-id', 'update-policy', 'assertion', 'ISBN', 'funder'];

  constructor(size: number) {
    super(size);
  }

  static get niceName() {
    return "SQLite/RAW";
  }

  async prepare() {
    return new Promise( (resolve, reject) => {
      this.db = new sqlite.Database(this.tempDir + '/database.sqlite', sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE, (err) => {
        if (err) {
          reject(err);
        } else {
          const crossrefCols = "'indexed' TEXT, 'reference-count' INTEGER, 'publisher' TEXT, 'issue' TEXT, 'content-domain' TEXT, 'short-container-title' TEXT, 'published-print' TEXT, 'DOI' TEXT, 'type' TEXT, 'created' TEXT, 'page' TEXT, 'source' TEXT, 'title' TEXT, 'prefix' TEXT, 'volume' TEXT, 'author' TEXT, 'member' TEXT, 'published-online' TEXT, 'container-title' TEXT, 'original-title' TEXT, 'deposited' TEXT, 'score' REAL, 'subtitle' TEXT, 'short-title' TEXT, 'issued' TEXT, 'URL' TEXT, 'ISSN' TEXT, 'subject' TEXT, 'license' TEXT, 'link' TEXT, 'alternative-id' TEXT, 'update-policy' TEXT, 'assertion' TEXT, 'ISBN' TEXT, 'funder' TEXT";
          this.db.run(`CREATE TABLE crossref (${crossrefCols});`, err => {
            if (err) {
              reject(err);
            } else {
              this.db.run("CREATE UNIQUE INDEX DOI_index ON crossref (DOI);", [], function(err) {
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  resolve();
                }
              });
            }
          });
        }
      });
    });
  }


  async cleanup() {
    return new Promise( (resolve, reject) => {
      this.db.close( err => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          this.db = null;
          resolve();
        }
      });
    });
  }

  async loadDB() {
    return new Promise( (resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("BEGIN TRANSACTION;");
        let statement = this.db.prepare('INSERT INTO crossref VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);');
        let c = 0;
        for (let data of this.data.crossrefData) {
          const values = [];
          for (let col of this.cols) {
            if (typeof data[col] === 'object' ) {
              values.push(JSON.stringify(data[col]));
            } else {
              values.push(data[col]);
            }
          }

          statement.run(values, (err) => {
            if (err) {console.log(err);}
          });
          c++;
          if (c >= this.size) {
            break;
          }
        }
        this.db.run("END TRANSACTION;");
        statement.finalize(err => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(err);
          }
        });
      });
    });
  }

  async getDocument(doi: string) {
    return new Promise( (resolve, reject) => {
      this.db.all(`SELECT * FROM crossref WHERE DOI = '${doi}' LIMIT 1;`, (err, rows) => {
        if (err) {reject(err);}
        else {resolve(rows[0]);}
      });
    });
  }

  async getCount() {
    return new Promise( (resolve, reject) => {
      this.db.each("SELECT COUNT(*) as c from crossref;", (err, row) => {
        if (err) {reject(err);}
        else {resolve(row.c);}
      });
    });
  }

  async performUpdates() {
    let statement = this.db.prepare('UPDATE crossref SET publisher = ? WHERE DOI = ?;');
    await new Promise( (resolve, reject) => {
      this.db.all("SELECT DOI, publisher from crossref;", (err, rows) => {
        if (err) {return reject(err);}

        this.db.serialize(() => {
          this.db.run("BEGIN TRANSACTION;");

          for (let row of rows) {
            statement.run(row.publisher + "!", row.DOI);
          }

          this.db.run("END TRANSACTION;", err => {
            err ? reject(err) : resolve();
          });
        });
      });
    });
    return new Promise( (resolve, reject) => {
      statement.finalize(err => {
        err ? reject(err) : resolve();
      });
    });
  }
}
