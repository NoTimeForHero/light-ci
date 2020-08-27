import { nanoid } from 'nanoid';
import * as child from 'child_process';

import { BUILD_STATUS } from './constants.js';

const deepCopy = (source) => JSON.parse(JSON.stringify(source));

const builds = {};
const buildLogs = {};

export function init(project) {
  console.log(`Initialize build project: ${project}`);
  const buildID = nanoid();
  const dateStart = Date.now();
  builds[project] = {
    name: project,
    buildID,
    status: BUILD_STATUS.ready,
    created: dateStart,
    updated: dateStart,
    canBuild: true,
  };
}

export function getLogs() {
  return buildLogs;
}

export function getBuilds() {
  return builds;
}

export function isBuilding(project) {
  const curBuild = builds[project];
  if (!curBuild) return false;
  return curBuild.status === BUILD_STATUS.processing;
}

export function build(project, script) {
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
      stdout: [], stderr: [], error: [],
    },
  };
  builds[project] = curentBuild;

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
      builds[project],
      {
        status: BUILD_STATUS.completed,
        updated,
        elapsed,
        exitCode,
        canBuild: true,
      },
    );
    if (builds[project]) buildLogs[curentBuild.buildID] = deepCopy(builds[project]);
  });
}
