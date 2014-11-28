FROM dockerfile/ansible
MAINTAINER Sean <adiktofsugar@gmail.com>

ADD ansible/inventory /etc/ansible/hosts
COPY code /var/lendsnap
COPY ansible /var/ansible

WORKDIR /var/ansible
EXPOSE 22 3000
