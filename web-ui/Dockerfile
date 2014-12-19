FROM phusion/baseimage:0.9.15
MAINTAINER Sean <adiktofsugar@gmail.com>

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

RUN apt-get update
RUN apt-get -y install nodejs nodejs-legacy npm
RUN npm install -g forever

VOLUME /var/lendsnap/uploaded
VOLUME /var/lendsnap/web-ui

EXPOSE 3000
RUN mkdir /etc/service/web-ui
RUN ln -s /var/lendsnap/web-ui/runit-services/web-ui/run /etc/service/web-ui/run
RUN /usr/sbin/enable_insecure_key

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
