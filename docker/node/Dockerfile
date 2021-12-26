FROM node:8-alpine
# FROM node:8.2.1-onbuild

WORKDIR /usr/src/app

# COPY ./app/package.json .
COPY ./app .

RUN apk add --update nodejs npm
RUN npm install
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]