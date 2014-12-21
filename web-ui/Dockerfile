FROM stackbrew/ubuntu
MAINTAINER Sean <anincrediblyshortname@gmail.com>

RUN apt-get update
RUN apt-get -y install nodejs nodejs-legacy npm

VOLUME /var/lendsnap/uploaded
VOLUME /var/lendsnap/media
COPY . /var/lendsnap/web-ui

RUN cd /var/lendsnap/web-ui && npm install

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
EXPOSE 3000

WORKDIR /var/lendsnap/web-ui
CMD node app.js
