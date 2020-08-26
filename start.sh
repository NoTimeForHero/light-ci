docker run \
	-v `pwd`/config:/app/config:ro \
	-p 3000:3000 \
	--name light-ci \
	-d notimeforhero/light-ci