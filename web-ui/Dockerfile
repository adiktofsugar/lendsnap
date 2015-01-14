FROM base-node
MAINTAINER Sean <anincrediblyshortname@gmail.com>

VOLUME /var/lendsnap/uploaded
VOLUME /var/lendsnap/media
COPY . /var/lendsnap/web-ui
RUN cd /var/lendsnap/web-ui && npm install

EXPOSE 3000

WORKDIR /var/lendsnap/web-ui
CMD /usr/sbin/sshd && node code/app.js
