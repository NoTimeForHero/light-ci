if [[ ("$1" == "1") || ("$1" == "t") || ("$1" == "true") ]]; then
	arg_detached=""
else
	arg_detached="-d"
fi

docker stop light-ci
docker rm light-ci
docker run \
	-v `pwd`/config:/app/config:ro \
	-v `pwd`/build/backend/modules:/app/modules:ro \
	-v `pwd`/build/backend/config.js:/app/config.js:ro \
	-v `pwd`/build/backend/index.js:/app/index.js:ro \
	-v `pwd`/temp:/app/temp \
	-p 3000:3000 \
	--name light-ci \
	$arg_detached notimeforhero/light-ci