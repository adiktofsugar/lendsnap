FROM scratch
MAINTAINER Lex Lapax <lexlapax@gmail.com>
ADD tiny-nodejs-wiki.tar /
RUN mv /etc/supervisord.conf /etc/supervisord.conf.bak
ADD supervisord.conf /etc/supervisord.conf
RUN mkdir -p /var/log/supervisor
CMD /usr/bin/supervisord
