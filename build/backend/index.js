import express from 'express';
// import bodyParser from 'body-parser';
// import util from 'util';
import fs from 'fs';
import path from 'path';

import * as builder from './modules/builder.js';
import config from './config.js';

const dirname = path.resolve();
const app = express();
const port = 3000;

if (!fs.existsSync('temp')) fs.mkdirSync('temp');

fs.readdir('/app/config/', (err, files) => {
  if (err) {
    console.error('Failed to list a tasks!', err);
    return;
  }
  files.forEach((project) => {
    const scriptFile = config.projects[project]?.script ?? 'build.sh';
    const scriptPath = `/app/config/${project}/${scriptFile}`;
    fs.exists(scriptPath, (exists) => {
      if (!exists) {
        console.log(`Для проекта "${project}" не найден скрипт запуска: ${scriptPath}`);
        return;
      }
      builder.init(project, scriptPath);
    });
  });
});

app.use(express.json());
app.use(express.static('public'));

builder.registerRoutes(app);

const tryBuild = (req, res) => {
  const { project } = req.params;

  if (!builder.hasProject(project)) {
    res.status(404);
    res.json({ error: 'NOT FOUND PROJECT' });
    return;
  }

  const build = builder.build(project);
  res.json({ status: 'ACCEPTED', build });
};

app.post('/api/build/:project', (req, res) => {
  tryBuild(req, res);
});

app.post('/api/webhook/:project', (req, res) => {
  tryBuild(req, res);
});

app.all('/*', (_, res) => res.sendFile(`${dirname}/public/index.html`));

app.listen(port, () => {
  console.log(`[CI-Light] Listening at http://localhost:${port}`);
});
