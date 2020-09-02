<?php
require __DIR__ . '/vendor/autoload.php';
require('config.php');

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

use Lcobucci\JWT\Builder;
use Lcobucci\JWT\Signer\Key;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Twig\Loader\FilesystemLoader;
use Twig\Environment;

$loader = new FilesystemLoader(__DIR__ . '/templates');
$twig = new Environment($loader, []);

function filter($array, $allowed) {
    return array_filter($array, function ($key) use ($allowed) {
        return in_array($key, $allowed);
    }, ARRAY_FILTER_USE_KEY);
}

function getRoute($config, $route) {
    $basePath = $config['BASE_PATH'];
    if (!$basePath) return "$route";
    return "$basePath/$route";
}

$app = AppFactory::create();

if ($config['BASE_PATH']) $app->setBasePath($config['BASE_PATH']);

$app->get('/login', function (Request $request, Response $response, array $args) use ($config, $twig) {
    $callback = $request->getQueryParams()['callback'];
    $template = $twig->load('login.twig');
    $body = $template->render(['action' => getRoute($config, 'verify'), 'callback' => $callback]);
    $response->getBody()->write($body);
    return $response;
});

$app->post('/verify', function (Request $request, Response $response, array $args) use ($config, $twig) {
    $parsedBody = filter($request->getParsedBody(), ['username', 'email', 'can_build', 'callback']);
    $params = array_merge(['action' => getRoute($config, 'dologin'), 'readonly' => true, 'params' => $parsedBody]);
    $template = $twig->load('verify.twig');
    $body = $template->render($params);
    $response->getBody()->write($body);
    return $response;
});


$app->post('/dologin', function (Request $request, Response $response, array $args) use ($config, $twig) {
    $params = $request->getParsedBody();
    $redirect = $params['callback'];
    $builder = (new Builder())
        ->expiresAt(time() + $config['TTL'])
        ->withClaim('username', $params['username'])
        ->withClaim('email', $params['email'])
        ;
    if ($params['can_build']) $builder->withClaim('can_build', 1);
    $token = $builder->getToken(new Sha256(), new Key( $config['SECRET_KEY'] ));
    return $response->withHeader('Location', "$redirect$token")->withStatus(302);
});

$app->get('/', function (Request $request, Response $response, array $args) {
    $response->getBody()->write('<h1>Нет данных для отображения</h1>');
    return $response->withStatus(404);
});

$app->run();
