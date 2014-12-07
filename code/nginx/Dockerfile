FROM ubuntu:14.04
MAINTAINER Sean <adiktofsugar@gmail.com>
# nginx
RUN apt-get update
RUN apt-get -y install nginx

EXPOSE 80

VOLUME /var/lendsnap/uploaded
COPY . /var/lendsnap/nginx/


RUN mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.original && \
    ln -s /var/lendsnap/nginx/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx"]

