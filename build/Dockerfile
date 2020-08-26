FROM node:buster as webpack_build
WORKDIR /build

COPY ./frontend/package*.json /build/
RUN npm install

COPY ./frontend /build
RUN npm run build



FROM node:buster

# Дополнительные пакеты:
# git - Для выгрузки репозиториев
# sshpass - Для деплоя через SCP путём ввода SSH пароля
# openssh-client - Возможно для работы SCP ?
RUN apt-get update && apt-get install -y git sshpass openssh-client

WORKDIR /app

COPY ./backend/package*.json /app/
RUN npm install --only=production

COPY ./backend /app
COPY --from=webpack_build /build/dist /app/public

RUN mkdir ~/.ssh/ && chmod +x entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]

CMD ["npm", "start" ]