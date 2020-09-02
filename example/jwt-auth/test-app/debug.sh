docker build -t notimeforhero/light-ci-jwt-example .
docker run --rm \
    -p 4000:3000 \
    -e BASE_PATH=/test-auth \
    -v `pwd`/config.php:/app/config.php:ro \
    -v `pwd`/index.php:/app/index.php:ro \
    -v `pwd`/templates:/app/templates:ro \
    --name jwt-test1 \
    notimeforhero/light-ci-jwt-example
