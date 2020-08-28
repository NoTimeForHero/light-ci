import { nanoid } from 'nanoid';
import * as child from 'child_process';

import { BUILD_STATUS } from './constants.js';
import { mapValues } from './utils.js';

let buildsLatest = {};
let buildsLogs = {};
let buildStorage = null;

const buildMap = new Map();
const scriptMap = new Map();

export async function initialize(storage) {
  buildStorage = storage;
  buildsLatest = await storage.getLatest();
  buildsLogs = await storage.getLogs();
}

export function init(project, script) {
  scriptMap.set(project, script);

  let buildID = buildsLatest[project];
  const log = buildsLogs[buildID];
  if (buildID && log) {
    console.log(`[Build] Лог для проекта "${project}" найден в базе данных!`);
    return;
  }

  console.log(`[Build] Создаём начальный лог: ${project}`);
  buildID = nanoid();
  const dateStart = Date.now();
  buildsLatest[project] = buildID;
  buildsLogs[buildID] = {
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

export function registerRoutes(express) {
  express.get('/test', (_, res) => res.json({ message: 'Hello world!' }));
  express.get('/api/build/:id', (req, res) => {
    const { id } = req.params;
    const log = buildsLogs[id];
    if (log) {
      res.json(buildsLogs[id]);
    } else {
      res.status(404);
      res.json({ error: 'Объект не найден!', id });
    }
  });
  express.get('/api/logs', (_, res) => {
    const filteredLogs = mapValues(buildsLogs, (item) => {
      const { logs, ...values } = item; // Исключаем тяжелые логи из списка билдов
      return values;
    });
    res.json(filteredLogs);
  });
  express.get('/api/projects', (_, res) => res.json(buildsLatest));
}

export function getStatus(project) {
  const buildID = buildsLatest[project];
  const curBuild = buildsLogs[buildID];
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
  buildsLogs[buildID] = curentBuild;
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
    buildsLogs[buildID] = curentBuild;
    await buildStorage.updateLatest(project, buildID);
    await buildStorage.addLog(buildID, curentBuild);
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
