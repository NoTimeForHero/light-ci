import { nanoid } from 'nanoid';
import * as child from 'child_process';

import { BUILD_STATUS } from './constants.js';
// import { deepCopy, mapValues } from './utils.js';

const buildsLatest = {};
const buildsLogs = {};

const buildMap = new Map();

export function init(project) {
  console.log(`Initialize build project: ${project}`);
  const buildID = nanoid();
  const dateStart = Date.now();
  buildsLatest[project] = buildID;
  buildsLogs[buildID] = {
    name: project,
    buildID,
    status: BUILD_STATUS.ready,
    created: dateStart,
    updated: dateStart,
    canBuild: true
  };
}

export function registerRoutes(express) {
  express.get('/test', (_, res) => res.json({ message: 'Hello world!' }));
  express.get('/api/build/:id', (req, res) => {
    const { id } = req.params;
    res.json(buildsLogs[id]);
  });
  express.get('/api/logs', (_, res) => res.json(buildsLogs));
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

function buildRaw(project, script) {
  const buildID = nanoid();
  const dateStart = Date.now();
  const curentBuild = {
    name: project,
    buildID,
    status: BUILD_STATUS.processing,
    created: dateStart,
    updated: dateStart,
    canBuild: false,
    logs: {
      stdout: [], stderr: [], error: []
    }
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
  process.on('close', (exitCode) => {
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
  });
  return buildID;
}

export function build(project, script) {
  const status = getStatus(project);

  if (status.isBuilding) {
    buildMap.set(project, { script });
    console.log('[buildMap] Added project to queue', project, script);
    return status.buildID;
  }

  buildMap.delete(project);
  console.log('[buildMap] Building project from queue', project, script);
  return buildRaw(project, script);
}

setInterval(() => {
  for (const entry of buildMap.entries()) {
    const [project, { script }] = entry;
    build(project, script);
  }
}, 5000);
