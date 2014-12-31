FROM base-node
MAINTAINER Sean <anincrediblyshortname@gmail.com>
COPY . /var/lendsnap/account
RUN cd /var/lendsnap/account && npm install
WORKDIR /var/lendsnap/account
EXPOSE 8080
CMD /usr/sbin/sshd && node app.js
