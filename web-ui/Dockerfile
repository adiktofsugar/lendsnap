FROM jprjr/tinynode
MAINTAINER Sean <anincrediblyshortname@gmail.com>

VOLUME /var/lendsnap/uploaded
VOLUME /var/lendsnap/media
COPY . /var/lendsnap/web-ui

EXPOSE 3000

ENTRYPOINT /bin/bash
WORKDIR /var/lendsnap/web-ui
CMD node app.js
