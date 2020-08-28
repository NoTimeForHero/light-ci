import express from 'express';
// import bodyParser from 'body-parser';
// import util from 'util';
import fs from 'fs';

import * as builder from './modules/builder.js';

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
app.get('/', (_, res) => res.sendFile('public/index.html'));

builder.registerRoutes(app);

app.post('/api/project/:project', (req, res) => {
  const { project } = req.params;
  const script = `/app/config/${project}/build.sh`;

  // TODO: Добавлять в очередь на повторный ребилд вместо выброса ошибки
  if (builder.isBuilding(project)) {
    res.status(503);
    res.json({ error: 'BUILD IN PROGRESS!' });
    return;
  }

  if (!fs.existsSync(script)) {
    res.status(404);
    res.json({ error: 'NOT FOUND PROJECT' });
    return;
  }

  const build = builder.build(project, script);
  res.json({ status: 'ACCEPTED', build });
});

app.listen(port, () => {
  console.log(`[CI-Light] Listening at http://localhost:${port}`);
});
