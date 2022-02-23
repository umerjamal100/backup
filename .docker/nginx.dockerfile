FROM nginx:latest

LABEL maintainer="sigmaprofile@hotmail.com"

COPY ./.docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
