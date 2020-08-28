/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */

class AbstractStorage {
  // eslint-disable-next-line no-unused-vars
  constructor(settings) {
    if (new.target === AbstractStorage) {
      throw new Error('Impossible to create instance of Abstract Class!');
    }
    console.log(`[Database] Создана база данных ${new.target.name}`);
  }

  async getLogs() {}

  async getLatest() {}

  async addLog(buildID, payload) {}

  async updateLatest(project, buildID) {}
}

class MemoryStorage extends AbstractStorage {
  constructor() {
    super();
    this.logs = {};
    this.latest = {};
  }

  async getLogs() {
    return this.logs;
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

let storage = null;

/**
 * Recieves or creates storage by settings
 * @param {Object} settings Storage settings
 * @returns {AbstractStorage} Storage
 */
export default function getDatabase(settings) {
  if (storage != null) return storage;
  if (settings == null) console.warn('[Database] В конфиге отсутствует секция database!');
  const type = settings?.type ?? 'memory';
  switch (type) {
    case 'memory':
      storage = new MemoryStorage(settings);
      break;
    default:
      throw new Error(`Неизвестный тип хранилища: ${type}`);
  }
  return storage;
}
