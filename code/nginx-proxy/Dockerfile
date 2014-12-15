FROM phusion/baseimage:0.9.15
MAINTAINER Sean <adiktofsugar@gmail.com>

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

RUN apt-get update
RUN apt-get -y install nginx

VOLUME /var/lendsnap/uploaded
VOLUME /var/lendsnap/media
VOLUME /var/lendsnap/nginx-proxy

RUN rm /etc/nginx/nginx.conf
RUN ln -s /var/lendsnap/nginx-proxy/nginx.conf /etc/nginx/nginx.conf
RUN ln -s /var/lendsnap/nginx-proxy/real-signed-cert /etc/nginx/real-signed-cert

EXPOSE 80 443

RUN mkdir /etc/service/nginx-proxy
RUN ln -s /var/lendsnap/nginx-proxy/run.sh /etc/service/nginx-proxy/run
RUN /usr/sbin/enable_insecure_key

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
