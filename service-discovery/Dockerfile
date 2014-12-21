FROM stackbrew/ubuntu
MAINTAINER Sean <anincrediblyshortname@gmail.com>

RUN apt-get update
RUN apt-get install -y nodejs nodejs-legacy npm
COPY . /var/lendsnap/service-discovery

RUN cd /var/lendsnap/service-discovery && npm install

WORKDIR /var/lendsnap/service-discovery
CMD /bin/bash
