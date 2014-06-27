FROM scratch
MAINTAINER Lex Lapax <lexlapax@gmail.com>
ADD rootfs.tar /
RUN mv /etc/supervisord.conf /etc/supervisord.conf.bak
ADD supervisord.conf /etc/supervisord.conf
CMD /usr/bin/supervisord
