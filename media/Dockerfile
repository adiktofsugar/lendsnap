FROM stackbrew/ubuntu
MAINTAINER Sean <anincrediblyshortname@gmail.com>

RUN apt-get update
RUN apt-get -y install nodejs nodejs-legacy npm
RUN npm install -g gulp

COPY . /var/lendsnap/media
RUN cd /var/lendsnap/media && npm install

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /var/lendsnap/media
CMD gulp && gulp watch
