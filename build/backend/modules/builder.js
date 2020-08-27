import { nanoid } from 'nanoid';
import * as child from 'child_process';

import { BUILD_STATUS } from './constants.js';

const deepCopy = (source) => JSON.parse(JSON.stringify(source));

const builds = {};
const buildLogs = {};

export function init(project) {
  console.log(`Initialize build project: ${project}`);
  const build_id = nanoid();
  const dateStart = Date.now();
  builds[project] = {
    name: project,
    build_id,
    status: BUILD_STATUS.ready,
    date: dateStart,
    can_build: true,
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
  const build_id = nanoid();
  const dateStart = Date.now();
  builds[project] = {
    name: project,
    build_id,
    status: BUILD_STATUS.processing,
    created: dateStart,
    updated: dateStart,
    can_build: false,
    logs: {
      stdout: [], stderr: [], error: [],
    },
  };

  const process = child.spawn(script);
  process.on('error', (error) => {
    builds[project].updated = Date.now();
    builds[project].logs.stderr.push(error.toString());
  });
  process.stdout.on('data', (data) => {
    builds[project].updated = Date.now();
    builds[project].logs.stdout.push(data.toString());
  });
  process.stderr.on('data', (data) => {
    builds[project].updated = Date.now();
    builds[project].logs.stderr.push(data.toString());
  });
  process.on('close', (exit_code) => {
    builds[project].logs.stdout.push(`** Spawned process exited with code ${exit_code} ***`);
    const updated = Date.now();
    const elapsed = updated - dateStart;
    Object.assign(builds[project], { status: BUILD_STATUS.completed, updated, elapsed, exit_code, can_build: true });
    if (builds[project]) buildLogs[build_id] = deepCopy(builds[project]);
  });
}