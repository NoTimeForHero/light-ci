import { nanoid } from 'nanoid';
import * as child from 'child_process';

import { BUILD_STATUS } from './constants.js';
import { mapValues } from './utils.js';

let buildsLatest = {};
let buildStorage = null;
const cacheLogs = {};

const buildMap = new Map();
const scriptMap = new Map();

export async function initialize(storage) {
  buildStorage = storage;
  buildsLatest = await storage.getLatest();
}

export async function init(project, script) {
  scriptMap.set(project, script);

  let buildID = buildsLatest[project];
  const log = await buildStorage.getLog(buildID);
  if (buildID && log) {
    console.log(`[Build] Лог для проекта "${project}" найден в базе данных!`);
    return;
  }

  console.log(`[Build] Создаём начальный лог: ${project}`);
  buildID = nanoid();
  const dateStart = Date.now();
  buildsLatest[project] = buildID;
  cacheLogs[buildID] = {
    project,
    buildID,
    status: BUILD_STATUS.ready,
    created: dateStart,
    updated: dateStart,
    canBuild: true
  };
}

export function hasProject(project) {
  return scriptMap.has(project);
}

export function registerRoutes(express, baseURL) {
  express.get(`${baseURL}build/:id`, async (req, res) => {
    const { id } = req.params;
    let log = cacheLogs[id];
    if (!log) log = await buildStorage.getLog(id);
    if (log) {
      res.json(log);
    } else {
      res.status(404);
      res.json({ error: 'Объект не найден!', id });
    }
  });
  express.get(`${baseURL}logs`, async (req, res) => {
    const count = req.query.count ?? 10;
    const offset = req.query.offset ?? 0;
    const dbLogs = await buildStorage.getLogs(count, offset);
    const mergedLogs = { ...cacheLogs, ...dbLogs.logs };
    const filteredLogs = mapValues(mergedLogs, (item) => {
      const { logs, ...values } = item; // Исключаем тяжелые логи из списка билдов
      return values;
    });
    res.json({ total: dbLogs.total, logs: filteredLogs });
  });
  express.get(`${baseURL}projects`, (_, res) => res.json(buildsLatest));
}

export function getStatus(project) {
  const buildID = buildsLatest[project];
  const curBuild = cacheLogs[buildID];
  return {
    buildID,
    isBuilding: curBuild?.status === BUILD_STATUS.processing
  };
}

async function buildRaw(project, meta) {
  const script = scriptMap.get(project);
  if (!script) throw new Error(`Не удалось найти билд-скрипт для проекта "${project}"!`);
  const buildID = nanoid();
  const dateStart = Date.now();
  const curentBuild = {
    project,
    buildID,
    status: BUILD_STATUS.processing,
    created: dateStart,
    updated: dateStart,
    canBuild: false,
    logs: {
      stdout: [], stderr: [], error: []
    },
    ...meta
  };
  cacheLogs[buildID] = curentBuild;
  buildsLatest[project] = buildID;

  const process = child.spawn(script);
  process.on('error', (error) => {
    curentBuild.updated = Date.now();
    curentBuild.logs.stderr.push(error.toString());
  });
  process.stdout.on('data', (data) => {
    curentBuild.updated = Date.now();
    curentBuild.logs.stdout.push(data.toString());
  });
  process.stderr.on('data', (data) => {
    curentBuild.updated = Date.now();
    curentBuild.logs.stderr.push(data.toString());
  });
  process.on('close', async (exitCode) => {
    curentBuild.logs.stdout.push(`** Spawned process exited with code ${exitCode} ***`);
    const updated = Date.now();
    const elapsed = updated - dateStart;
    Object.assign(
      curentBuild,
      {
        status: BUILD_STATUS.completed,
        updated,
        elapsed,
        exitCode,
        canBuild: true
      }
    );
    await buildStorage.updateLatest(project, buildID);
    await buildStorage.addLog(buildID, curentBuild);
    delete cacheLogs[buildID];
  });
  return buildID;
}

export async function build(project, meta) {
  const status = getStatus(project);
  if (status.isBuilding) {
    buildMap.set(project, meta);
    console.log('[Build] Проект добавлен в очередь: ', project);
    return status.buildID;
  }
  buildMap.delete(project);
  console.log('[Build] Запущен билд проекта: ', project);
  return buildRaw(project, meta);
}

setInterval(() => {
  for (const entry of buildMap.entries()) {
    const [project, meta] = entry;
    build(project, meta);
  }
}, 5000);
