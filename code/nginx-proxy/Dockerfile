FROM ubuntu:14.04
MAINTAINER Sean <adiktofsugar@gmail.com>

RUN apt-get update
RUN apt-get -y install nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY real-signed-cert /etc/nginx/real-signed-cert

EXPOSE 80 443
CMD ["nginx"]
