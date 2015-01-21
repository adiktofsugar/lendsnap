FROM base-node
MAINTAINER Sean <anincrediblyshortname@gmail.com>
COPY . /var/lendsnap/db
RUN cd /var/lendsnap/db && npm install
WORKDIR /var/lendsnap/db
CMD /usr/sbin/sshd && node code/announce.js
