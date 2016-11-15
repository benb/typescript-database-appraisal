import * as fs from 'fs-extra-promise';
import * as sqlite from 'sqlite3';
import Sequelize = require("sequelize");
import { DBBench } from './dbbench';
import { CrossRefSQLRecord, CrossRefRecord } from './crossRefRecord';

export class SequelizeBench extends DBBench {
  db: any;
  CrossRefSequelize: any;
  serializedCols = ['indexed', 'content-domain', 'short-container-title', 'published-print', 'created', 'title', 'author', 'published-online', 'container-title', 'original-title', 'deposited', 'subtitle', 'short-title', 'issued', 'ISSN', 'subject', 'license', 'link', 'alternative-id', 'assertion', 'ISBN', 'funder'];

  constructor(size: number) {
    super(size);
  }

  static get niceName() {
    return "SQLite/Sequelize";
  }

  async prepare() {
    this.db = new Sequelize('crossref', null , null, {
        dialect: "sqlite",
        logging: null,
        storage: this.tempDir + "/database.sqlite"
    });
    const getters = {};
    const setters = {};

    for (let col in this.serializedCols) {
      const c = col;
      getters['col'] = function() {
        return JSON.parse(this.getDataValue(c));
      };
      setters['col'] = function(value: any) {
        this.setDataValue(JSON.stringify(value));
      }
    }

    this.CrossRefSequelize = this.db.define('crossref', {
        'indexed': Sequelize.STRING,
        'reference-count': Sequelize.INTEGER,
        'publisher': Sequelize.STRING,
        'issue': Sequelize.STRING,
        'content-domain': Sequelize.STRING,
        'short-container-title': Sequelize.STRING,
        'published-print': Sequelize.STRING,
        'DOI': {type: Sequelize.STRING, primaryKey: true},
        'type': Sequelize.STRING,
        'created': Sequelize.STRING,
        'page': Sequelize.STRING,
        'source': Sequelize.STRING,
        'title': Sequelize.STRING,
        'prefix': Sequelize.STRING,
        'volume': Sequelize.STRING,
        'author': Sequelize.STRING,
        'member': Sequelize.STRING,
        'published-online': Sequelize.STRING,
        'container-title': Sequelize.STRING,
        'original-title': Sequelize.STRING,
        'deposited': Sequelize.STRING,
        'score': Sequelize.REAL,
        'subtitle': Sequelize.STRING,
        'short-title': Sequelize.STRING,
        'issued': Sequelize.STRING,
        'URL': Sequelize.STRING,
        'ISSN': Sequelize.STRING,
        'subject': Sequelize.STRING,
        'license': Sequelize.STRING,
        'link': Sequelize.STRING,
        'alternative-id': Sequelize.STRING,
        'update-policy': Sequelize.STRING,
        'assertion': Sequelize.STRING,
        'ISBN': Sequelize.STRING,
        'funder': Sequelize.STRING
    }, {getterMethods: getters, setterMethods: setters});

    return this.CrossRefSequelize.sync();

  }


  async cleanup() {
    return this.db.close();
  }

  async loadDB() {
    let c = 0;
    const t = await this.db.transaction();
    for (let data of this.data.crossrefData) {
      const serializedData = {};
      for (let field of Object.keys(data)) {
        let d = data[field];
        if (this.serializedCols.indexOf(field) > -1) {
          d = JSON.stringify(d);
        }
        serializedData[field] = d;
      }

      let dbEntry = await this.CrossRefSequelize.create(serializedData, {transaction: t});
      c++;
      if (c >= this.size) {
        return t.commit();
      }
    }
    return t.commit();
  }

  async getDocument(doi: string) {
    const result = await this.CrossRefSequelize.findOne({where: {DOI: doi}});
    return result;
  }

  async getCount() {
    return this.CrossRefSequelize.count();
  }

  async performUpdates() {
    const t = await this.db.transaction();
    const allData = await this.CrossRefSequelize.findAll({attributes: ['DOI', 'publisher']});
    for (let datum of allData) {
      await datum.set('publisher', datum.get('publisher') + "!");
      await datum.save({transaction: t});
    }
    return t.commit();
  }
}
