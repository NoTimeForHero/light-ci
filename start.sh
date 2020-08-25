docker stop light-ci
docker rm light-ci
# --env-file *.env
#	-v `pwd`/temp:/app/temp \
docker run \
	-v `pwd`/config:/app/config:ro \
	-v `pwd`/build/index.js:/app/index.js:ro \
	-v `pwd`/build/public:/app/public:ro \
	-p 3000:3000 \
	--name light-ci \
	-d notimeforhero/light-ci