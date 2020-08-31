command=$1
docker-compose -f docker-compose-debug.yml -p light-ci ${command:=up -d} $2 $3 $4 $5