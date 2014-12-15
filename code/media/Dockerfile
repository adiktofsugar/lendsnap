FROM phusion/baseimage:0.9.15
MAINTAINER Sean <adiktofsugar@gmail.com>

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

RUN apt-get update
RUN apt-get -y install nodejs nodejs-legacy npm
RUN npm install -g gulp

VOLUME /var/lendsnap/media

RUN mkdir /etc/service/media
RUN ln -s /var/lendsnap/media/run.sh /etc/service/media/run
RUN /usr/sbin/enable_insecure_key

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*



