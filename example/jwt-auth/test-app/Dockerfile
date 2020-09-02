FROM php:7.4-cli-alpine

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

COPY composer.* /app/
RUN composer install

COPY . /app
EXPOSE 3000
CMD php -S 0.0.0.0:3000