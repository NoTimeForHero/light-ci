docker stop light-ci
docker rm light-ci
docker run \
	-v `pwd`/config:/app/config:ro \
	-v `pwd`/build/backend/index.js:/app/index.js:ro \
	-v `pwd`/temp:/app/temp \
	-p 3000:3000 \
	--name light-ci \
	-d notimeforhero/light-ci