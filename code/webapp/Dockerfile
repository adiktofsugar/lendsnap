FROM ubuntu:14.04
MAINTAINER Sean <adiktofsugar@gmail.com>
# nginx
RUN apt-get update
RUN apt-get -y install nginx
EXPOSE 80

VOLUME /var/lendsnap
COPY . /var/lendsnap

RUN mkdir -p /etc/nginx/nginx.conf.d
RUN ln -s /var/lendsnap/nginx.conf /etc/nginx/nginx.conf.d/lendsnap.com.conf

CMD nginx
