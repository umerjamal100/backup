FROM node:latest

LABEL maintainer="sigmaprofile@hotmail.com"

COPY . /usr/src/app

WORKDIR /usr/src/app

VOLUME [ "/usr/src/app" ]

RUN npm run build

ENV NODE_ENV=prod
ENV PORT=3000

EXPOSE 3000

CMD [ "node", "dist/app.js" ]

