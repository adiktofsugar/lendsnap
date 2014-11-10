FROM ubuntu:14.04
MAINTAINER Sean <adiktofsugar@gmail.com>

RUN apt-get update
RUN apt-get -y install nodejs nodejs-legacy npm
EXPOSE 3000

# mysql
RUN apt-get -y install mysql-server mysql-client
EXPOSE 3306

RUN mysql_install_db

VOLUME /var/lendsnap
COPY . /var/lendsnap

WORKDIR /var/lendsnap/node
CMD forever app.js
