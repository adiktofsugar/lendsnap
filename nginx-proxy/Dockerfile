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
RUN mkdir /etc/nginx/proxies && \
    chown www-data:www-data /etc/nginx/proxies && \
    chmod 600 /etc/nginx/proxies

EXPOSE 80 443

RUN mkdir /etc/service/nginx
RUN ln -s /var/lendsnap/nginx-proxy/runit-services/nginx/run /etc/service/nginx/run
RUN mkdir /etc/service/nginx-proxy-monitor
RUN ln -s /var/lendsnap/nginx-proxy/runit-services/nginx-proxy-monitor/run \
    /etc/service/nginx-proxy-monitor/run

RUN /usr/sbin/enable_insecure_key
# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
