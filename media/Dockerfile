FROM base-node
MAINTAINER Sean <anincrediblyshortname@gmail.com>

RUN npm install -g gulp

COPY . /var/lendsnap/media
RUN cd /var/lendsnap/media && npm install
VOLUME /var/lendsnap/media

WORKDIR /var/lendsnap/media
CMD /usr/sbin/sshd && gulp && gulp watch
