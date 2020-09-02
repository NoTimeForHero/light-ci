import express from 'express';
// import bodyParser from 'body-parser';
import util from 'util';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import jwt from 'jsonwebtoken';

import * as builder from './modules/builder.js';
import security from './modules/security.js';
import getDatabase from './modules/database.js';
// import config from './config.js';

const fsReadDir = util.promisify(fs.readdir);
const ejsRenderFile = util.promisify(ejs.renderFile);

const configPath = fs.existsSync('./config/config.js') ? './config/config.js' : './config.js';
// Когда ES-Lint начнёт поддерживать top-level await? (>_<)
export const waitConfig = import(configPath).then((x) => x.default);

// eslint-disable-next-line import/prefer-default-export
export const port = 3000;
export const dirname = path.resolve();
export const pathStatic = `${dirname}/public`;
export const baseURL = process.env.BASE_URL || '/';
export const apiPrefix = 'api/';

const getAuthURL = async () => {
  const config = await waitConfig;
  const authURL = config?.authorization?.authUrl;
  if (!authURL) return null;
  return authURL;
};

const app = express();

const sendEntrypointFile = async (res) => {
  const addPrefix = (prefix) => (arr) => arr
    .filter((x) => !x.endsWith('.map'))
    .map((item) => `${prefix}${item}`);
  const tplFile = `${dirname}/index.ejs`;
  const data = {
    baseURL,
    authURL: await getAuthURL(),
    styles: await fsReadDir(`${pathStatic}/css`).then(addPrefix(`${baseURL}css/`)),
    scripts: await fsReadDir(`${pathStatic}/js`).then(addPrefix(`${baseURL}js/`))
  };
  const template = await ejsRenderFile(tplFile, data);
  res.status(200);
  res.set('Content-Type', 'text/html');
  res.send(template);
};

const loadProjects = async (config, err, files) => {
  if (err) {
    console.error('Failed to list a tasks!', err);
    return;
  }
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
};

// https://flaviocopes.com/express-get-raw-body/
// Хак нужный для того, чтобы верифицировать чистый response по SHA1 хедеру
// К сожалению, работает только с JSON из-за сложности парсинга чистого HTTP содержимого
app.use(express.json({
  verify: (req, _, buf) => {
    req.rawBody = buf;
  }
}));

app.use(async (req, res, next) => {
  const config = await waitConfig.then((x) => x.authorization);
  if (!config || config.type === 'disabled') return next();
  const isProtected = req.path.startsWith(baseURL + apiPrefix);
  if (!isProtected) return next();
  const showError = (message) => {
    res.status(403);
    res.json({ message, type: 'authorization' });
  };
  const auth = req.get('Authorization');
  if (!auth) return showError('Требуется авторизация!');
  const [type, token] = auth.split(' ');
  if (!type || !token || type !== 'Bearer') return showError('Неправильный формат!');
  try {
    req.token = jwt.verify(token, config.secret, { alghorithm: config.alghorithm });
    return next();
  } catch (err) {
    return showError(err.message);
  }
});

app.get(baseURL, (_, res) => sendEntrypointFile(res));
app.use(baseURL, express.static(pathStatic));

builder.registerRoutes(app, baseURL + apiPrefix);

const tryBuild = async (req, res, meta) => {
  const { project } = req.params;

  if (!builder.hasProject(project)) {
    res.status(404);
    res.json({ error: 'Project not found', project });
    return;
  }

  const build = await builder.build(project, meta);
  res.json({ status: 'ACCEPTED', build });
};

app.post(`${baseURL}${apiPrefix}build/:project`, async (req, res) => {
  let meta = null;
  const { username, email } = req.token ?? {};
  if (username) meta = { verified: { subject: username, email, company: false } };
  await tryBuild(req, res, meta);
});

app.post(`${baseURL}${apiPrefix}webhook/:project`, async (req, res) => {
  const { project } = req.params;
  const config = await waitConfig;
  const validation = security.validateWebhook(req, config.projects[project]);
  if (validation?.error) {
    res.status(403);
    res.json(validation);
    return;
  }
  await tryBuild(req, res, validation);
});

app.all(`${baseURL}*`, (_, res) => sendEntrypointFile(res));

app.listen(port, () => {
  console.log(`[CI-Light] Listening at http://localhost:${port}`);
});

waitConfig.then(async (config) => {
  console.log(util.inspect(config, { depth: null, colors: true }));
  const database = getDatabase(config.database);
  await builder.initialize(database);
  if (!fs.existsSync('temp')) fs.mkdirSync('temp');
  fs.readdir('/app/config/', (err, files) => loadProjects(config, err, files));
});
