#!/bin/bash
export PROJECT=template
export GIT_URL=https://github.com/sveltejs/$PROJECT.git

cd temp

if [ -d "$PROJECT" ]; then
	echo "************ GIT PULL ************"
	cd $PROJECT
	git pull --force --prune
else
	echo "************ GIT CLONE ************"
	git clone $GIT_URL
	cd $PROJECT	
fi

echo "************ NPM INSTALL ************"
## http://www.tiernok.com/posts/2019/faster-npm-installs-during-ci/#warning-npm-ci-performance
## Если нужна чистая сборка:
# npm ci
## Если нужна быстрая сборка:
npm install --prefer-offline --no-audit
echo "************ NPM RUN BUILD ************"
npm run build

ls -lah public/build