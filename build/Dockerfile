FROM node:buster

# Дополнительные пакеты:
# git - Для выгрузки репозиториев
# sshpass - Для деплоя через SCP путём ввода SSH пароля
# openssh-client - Возможно для работы SCP ?
RUN apt-get update && apt-get install -y git sshpass openssh-client

WORKDIR /app
COPY . /app

COPY entrypoint.sh /entrypoint.sh
RUN mkdir ~/.ssh/ && chmod +x /entrypoint.sh

RUN npm ci --only=production

ENTRYPOINT [ "/entrypoint.sh" ]

CMD ["npm", "start" ]