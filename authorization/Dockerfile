FROM lendsnap/base-node
MAINTAINER Sean <anincrediblyshortname@gmail.com>
COPY . /var/lendsnap/authorization
RUN cd /var/lendsnap/authorization && npm install
CMD /usr/bin/sshd && node app.js
