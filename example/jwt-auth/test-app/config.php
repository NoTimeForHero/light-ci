<?php

$config = [];
$config['BASE_PATH'] = $_ENV['BASE_PATH'];
$config['SECRET_KEY'] = $_ENV['SECRET_KEY'] ?? 'your_secret_key';
$config['TTL'] = $_ENV['TTL'] ?? 24 * 60 * 60;