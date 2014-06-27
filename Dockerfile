FROM scratch
MAINTAINER Lex Lapax <lexlapax@gmail.com>
ADD tiny-nodejs-wiki.tar /
RUN ssh-keygen -t rsa -f /etc/ssh_host_rsa_key
RUN npm install wiki
RUN mv /etc/supervisord.conf /etc/supervisord.conf.bak
ADD supervisord.conf /etc/supervisord.conf
RUN mkdir -p /var/log/supervisor
CMD /usr/bin/supervisord
