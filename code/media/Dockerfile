FROM ubuntu:14.04
MAINTAINER Sean <adiktofsugar@gmail.com>

RUN apt-get update
RUN apt-get -y install nginx
#RUN apt-get -y install nodejs nodejs-legacy npm

COPY . /var/lendsnap/media

#RUN cd /var/lendsnap/media && \
#    npm install && \
#    gulp

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3001
CMD ["nginx"]
