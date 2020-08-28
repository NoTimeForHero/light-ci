import express from 'express';
// import bodyParser from 'body-parser';
import util from 'util';
import fs from 'fs';
import path from 'path';

import * as builder from './modules/builder.js';
import security from './modules/security.js';
// import config from './config.js';

const configPath = fs.existsSync('./config/config.js') ? './config/config.js' : './config.js';
// Когда ES-Lint начнёт поддерживать top-level await? (>_<)
const waitConfig = import(configPath).then((x) => x.default);

waitConfig.then((x) => console.log(util.inspect(x, {
  depth: null,
  colors: true
})));

const dirname = path.resolve();
const app = express();
const port = 3000;

if (!fs.existsSync('temp')) fs.mkdirSync('temp');

fs.readdir('/app/config/', async (err, files) => {
  if (err) {
    console.error('Failed to list a tasks!', err);
    return;
  }
  const config = await waitConfig;
  files.forEach(async (project) => {
    const rootPath = `/app/config/${project}`;
    if (await fs.promises.lstat(rootPath).then((x) => x.isFile())) return;
    const scriptFile = config.projects[project]?.script ?? 'build.sh';
    const scriptPath = `${rootPath}/${scriptFile}`;
    fs.exists(scriptPath, (exists) => {
      if (!exists) {
        console.log(`Для проекта "${project}" не найден скрипт запуска: ${scriptPath}`);
        return;
      }
      builder.init(project, scriptPath);
    });
  });
});

// https://flaviocopes.com/express-get-raw-body/
// Хак нужный для того, чтобы верифицировать чистый response по SHA1 хедеру
// К сожалению, работает только с JSON из-за сложности парсинга чистого HTTP содержимого
app.use(express.json({
  verify: (req, _, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.static('public'));

builder.registerRoutes(app);

const tryBuild = (req, res, meta) => {
  const { project } = req.params;

  if (!builder.hasProject(project)) {
    res.status(404);
    res.json({ error: 'Project not found', project });
    return;
  }

  const build = builder.build(project, meta);
  res.json({ status: 'ACCEPTED', build });
};

app.post('/api/build/:project', (req, res) => {
  tryBuild(req, res);
});

app.post('/api/webhook/:project', async (req, res) => {
  const { project } = req.params;
  const config = await waitConfig;
  const validation = security.validateWebhook(req, config.projects[project]);
  if (validation?.error) {
    res.status(403);
    res.json(validation);
    return;
  }
  tryBuild(req, res, validation);
});

app.all('/*', (_, res) => res.sendFile(`${dirname}/public/index.html`));

app.listen(port, () => {
  console.log(`[CI-Light] Listening at http://localhost:${port}`);
});
