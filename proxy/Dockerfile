FROM base-node
MAINTAINER Sean <anincrediblyshortname@gmail.com>
COPY . /var/lendsnap/proxy
RUN cd /var/lendsnap/proxy && npm install
WORKDIR /var/lendsnap/proxy
CMD /usr/sbin/sshd && node app.js
