#!/bin/bash
export PROJECT=example
export GIT_URL=git@github.com:example/$PROJECT.git

## Указываем SSH ключ для выгрузки из GIT-а (лучше всего создать Read-Only Deploy ключ)
export GIT_SSH_COMMAND="ssh -i ${0%/*}/key -o IdentitiesOnly=yes"
echo GIT COMMAND: $GIT_SSH_COMMAND
cd temp

if [ -d "$PROJECT" ]; then
	echo "************ GIT PULL ************"
	cd $PROJECT
	git clean  -d  -f .
	git pull --force --prune
else
	echo "************ GIT CLONE ************"
	git clone $GIT_URL
	cd $PROJECT	
fi

if [[ $(basename `pwd`) != "$PROJECT" ]]; then
	echo FATAL ERROR: Not in project directory! >&2
	exit 2
fi

echo "************ NPM INSTALL ************"
## Если нужна чистая сборка:
# npm ci
## Если нужна быстрая сборка:
npm install --prefer-offline --no-audit

echo "************ RUN TESTS ************"
if ! npm test; then
	echo FATAL ERROR: Test running failed with code: $? >&2
	exit 4
fi

echo "************ RUN BUILD ************"
npm run build

echo "************ SCP DEPLOY ************"
sshpass -p "some_example_password" \
	scp -P 22022 -r local_build_path user@example.org:remote_path
