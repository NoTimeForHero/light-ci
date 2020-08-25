const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

const child = require('child_process');

let BUILDS = {};
let BUILDS_IN_PROGRESS = {};

if (!fs.existsSync('temp')) fs.mkdirSync('temp');

app.use(express.json());
app.use(express.static('public'));
app.get('/', (_, res) => res.sendFile('public/index.html'));

app.get('/last-builds.json', (_, res) => res.json(BUILDS));

app.post('/project/:project', (req, res) => {
	const project = req.params.project;
	const script = `/app/config/${project}/build.sh`;

	// TODO: Добавлять в очередь на повторный ребилд вместо выброса ошибки
	if (BUILDS_IN_PROGRESS[project]) {
		res.status(503);
		res.send('BUILD IN PROGRESS!');
		return;
	}

	if (!fs.existsSync(script)) {
		res.status(404);
		res.send('NOT FOUND!');
		return;		
	}

	res.send("ACCEPTED!");

	const dateStart = Date.now();
	BUILDS_IN_PROGRESS[project] = true;
	BUILDS[project] = {name: project, status: "PROCESSING", date: dateStart, logs: {
		stdout: [], stderr: [], error: []
	}}

	var process = child.spawn(script);
	process.stdout.on('data', (data) => {
		BUILDS[project].logs.stdout.push(data.toString());
	})
	process.stderr.on('data', (data) => {
		BUILDS[project].logs.stderr.push(data.toString());
	})		
	process.on('close', (exit_code) => {
		delete BUILDS_IN_PROGRESS[project];
		BUILDS[project].logs.stdout.push(`** Spawned process exited with code ${exit_code} ***`);
		const dateEnd = Date.now();
		const elapsed = dateEnd - dateStart;
		Object.assign(BUILDS[project], {status:"COMPLETED", dateEnd, elapsed, exit_code });
	});
})

app.listen(port, () => {
	console.log(`[CI-Light] Listening at http://localhost:${port}`)
})
