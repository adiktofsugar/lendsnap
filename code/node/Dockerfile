FROM ubuntu:14.04
MAINTAINER Sean <adiktofsugar@gmail.com>

RUN apt-get update && \
    apt-get -y install nodejs nodejs-legacy npm
RUN npm install -g forever

EXPOSE 3000

ENV DB_NAME lendsnap
ENV DB_USER lendsnap
ENV DB_PASSWORD a

VOLUME /var/lendsnap
COPY . /var/lendsnap/node

WORKDIR /var/lendsnap/node
CMD ["nodejs", "app.js"]
