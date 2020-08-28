import express from 'express';
// import bodyParser from 'body-parser';
// import util from 'util';
import fs from 'fs';
import path from 'path';

import * as builder from './modules/builder.js';

const dirname = path.resolve();
const app = express();
const port = 3000;

if (!fs.existsSync('temp')) fs.mkdirSync('temp');

fs.readdir('/app/config/', (err, files) => {
  if (err) {
    console.error('Failed to list a tasks!', err);
    return;
  }
  files.forEach((project) => fs.exists(`/app/config/${project}/build.sh`, (exists) => {
    if (exists) builder.init(project);
  }));
});

app.use(express.json());
app.use(express.static('public'));

builder.registerRoutes(app);

const tryBuild = (req, res) => {
  const { project } = req.params;
  const script = `/app/config/${project}/build.sh`;

  if (!fs.existsSync(script)) {
    res.status(404);
    res.json({ error: 'NOT FOUND PROJECT' });
    return;
  }

  const build = builder.build(project, script);
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
