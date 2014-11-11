FROM ubuntu:14.04
MAINTAINER Sean <adiktofsugar@gmail.com>

RUN apt-get update && \
    apt-get -y install mysql-server mysql-client

RUN mysql_install_db
RUN /etc/init.d/mysql start

EXPOSE 3306
