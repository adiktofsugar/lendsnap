FROM ubuntu:14.04
MAINTAINER Sean <adiktofsugar@gmail.com>

RUN apt-get update
RUN apt-get -y install nodejs nodejs-legacy npm
RUN npm install -g forever

EXPOSE 3000

VOLUME /var/lendsnap/uploaded
COPY . /var/lendsnap/node

WORKDIR /var/lendsnap/node
CMD ["forever", "-w", "app.js"]
