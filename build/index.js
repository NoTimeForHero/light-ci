const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const util = require('util');
const app = express();
const port = 3000;

const child = require('child_process');

let builds = {};

let BUILD_STATUS = {"ready": 1, "processing": 2, "completed": 3};

if (!fs.existsSync('temp')) fs.mkdirSync('temp');

app.use(express.json());
app.use(express.static('public'));
app.get('/', (_, res) => res.sendFile('public/index.html'));

app.get('/last-builds.json', (_, res) => res.json(builds));

fs.readdir('/app/config/', (err, files) => {
	if (err) {
		console.error("Failed to list a tasks!", err);
		return;
	}
	files.forEach(project => fs.exists(`/app/config/${project}/build.sh`, exists => {
		if (!exists) return;
		console.log("Found a build project: " + project);		
		const dateStart = Date.now();
		builds[project] = {name: project, status: BUILD_STATUS.ready, date: dateStart, can_build: true};
	}));
});

app.post('/project/:project', (req, res) => {
	const project = req.params.project;
	const script = `/app/config/${project}/build.sh`;

	// TODO: Добавлять в очередь на повторный ребилд вместо выброса ошибки
	if (builds?.[project].status === BUILD_STATUS.processing) {
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
	builds[project] = {name: project, status: BUILD_STATUS.processing, date: dateStart, can_build: false, logs: {
		stdout: [], stderr: [], error: []
	}}

	const process = child.spawn(script);
	process.on('error', error => {
		builds[project].logs.stderr.push(error.toString());			
	});
	process.stdout.on('data', (data) => {
		builds[project].logs.stdout.push(data.toString());
	})
	process.stderr.on('data', (data) => {
		builds[project].logs.stderr.push(data.toString());
	})		
	process.on('close', (exit_code) => {
		builds[project].logs.stdout.push(`** Spawned process exited with code ${exit_code} ***`);
		const dateEnd = Date.now();
		const elapsed = dateEnd - dateStart;
		Object.assign(builds[project], {status: BUILD_STATUS.completed, dateEnd, elapsed, exit_code, can_build: true });
	});
})

app.listen(port, () => {
	console.log(`[CI-Light] Listening at http://localhost:${port}`)
})
