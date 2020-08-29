/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import sqliteBuilder from 'sqlite3';

const sqlite = sqliteBuilder.verbose();

class MemoryStorage {
  constructor() {
    this.logs = {};
    this.latest = {};
  }

  async getLogs(count = 10, offset = 0) {
    return this.logs;
  }

  async getLog(buildID) {
    return this.logs[buildID];
  }

  async getLatest() {
    return this.latest;
  }

  async addLog(buildID, payload) {
    console.log(`[Database] Запись в лог билда ${buildID}`);
    this.logs[buildID] = payload;
  }

  async updateLatest(project, buildID) {
    console.log(`[Database] Для проекта ${project} установлен текущий билд ${buildID}`);
    this.latest[project] = buildID;
  }
}

class SqliteStorage extends MemoryStorage {
  constructor(settings) {
    super();
    const { filename } = settings;
    if (!filename) throw new Error('Не указан файл (filename) для хранения SQLite!');
    this.database = new sqlite.Database(filename);
    this.database.serialize(() => {
      const queries = [
        `--DROP TABLE IF EXISTS logs;
        CREATE TABLE IF NOT EXISTS logs (
          buildID text NOT NULL,
          project text NOT NULL,
          created DATETIME NOT NULL,
          payload JSON NULL
        );`,
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_buildID ON logs (buildID);',
        'CREATE INDEX IF NOT EXISTS idx_project ON logs (project);',
        'CREATE INDEX IF NOT EXISTS idx_created ON logs (created);',
        `--DROP TABLE IF EXISTS latest;
        CREATE TABLE IF NOT EXISTS latest (
          project text NOT NULL,  
          buildID text NOT NULL
        );`,
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_primary ON latest(project);'
      ];
      queries.forEach((query) => this.database.run(query));
    });
  }

  async getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      const onDone = (error, data) => {
        if (error) reject(error);
        resolve(data);
      };
      this.database.all(sql, params, onDone);
    });
  }

  async runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      const onDone = (error, data) => {
        if (error) reject(error);
        resolve(data);
      };
      this.database.run(sql, params, onDone);
    });
  }

  async getLog(buildID) {
    const logs = await this.getQuery('SELECT * FROM logs WHERE buildID = ?', [buildID]);
    const [record] = logs.map((el) => {
      const { payload, ...values } = el;
      // eslint-disable-next-line no-param-reassign
      return { ...values, ...JSON.parse(payload) };
    });
    return record;
  }

  async getLogs(count = 10, offset = 0) {
    const total = await this.getQuery('SELECT COUNT(buildID) AS count FROM logs').then((x) => x[0]?.count);
    let logs = await this.getQuery('SELECT * FROM logs ORDER BY created DESC LIMIT ? OFFSET ?', [count, offset]);
    logs = logs.reduce((obj, el) => {
      const { buildID, payload, ...values } = el;
      // eslint-disable-next-line no-param-reassign
      obj[buildID] = { ...values, ...JSON.parse(payload) };
      return obj;
    }, {});
    return { total, logs };
  }

  async getLatest() {
    let latest = await this.getQuery('SELECT * FROM latest');
    latest = latest.reduce((obj, el) => {
      // eslint-disable-next-line no-param-reassign
      obj[el.project] = el.buildID;
      return obj;
    }, {});
    return latest;
  }

  async addLog(buildID, payload) {
    console.log(`[Database] Запись в лог билда ${buildID}`);
    this.logs[buildID] = payload;
    const { project, created } = payload;
    await this.runQuery(
      'INSERT INTO logs(buildID, project, created, payload) VALUES (?,?,?,?)',
      [buildID, project, created, JSON.stringify(payload)]
    );
  }

  async updateLatest(project, buildID) {
    console.log(`[Database] Для проекта ${project} установлен текущий билд ${buildID}`);
    this.latest[project] = buildID;
    await this.runQuery(
      `INSERT INTO latest(project,buildID) VALUES(?,?)
      ON CONFLICT(project) DO UPDATE SET buildID = excluded.buildID;`,
      [project, buildID]
    );
  }
}

let storage = null;

/**
 * Recieves or creates storage by settings
 * @param {Object} settings Storage settings
 * @returns {MemoryStorage} Storage
 */
export default function getDatabase(settings) {
  if (storage != null) return storage;
  if (settings == null) console.warn('[Database] В конфиге отсутствует секция database!');
  const type = settings?.type ?? 'memory';
  switch (type) {
    case 'memory':
      storage = new MemoryStorage(settings);
      break;
    case 'sqlite':
      storage = new SqliteStorage(settings);
      break;
    default:
      throw new Error(`Неизвестный тип хранилища: ${type}`);
  }
  return storage;
}
