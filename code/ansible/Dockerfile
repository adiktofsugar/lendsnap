FROM ubuntu:14.04
MAINTAINER Sean <adiktofsugar@gmail.com>

RUN apt-get update
RUN apt-get install -y python-yaml python-jinja2 git
RUN git clone http://github.com/ansible/ansible.git /tmp/ansible
ENV PATH /tmp/ansible/bin:/sbin:/usr/sbin:/usr/bin
ENV ANSIBLE_LIBRARY /tmp/ansible/library
ENV PYTHONPATH /tmp/ansible/lib:$PYTHON_PATH
ADD inventory /etc/ansible/hosts

RUN git clone git@bitbucket.org:adiktofsugar/lendsnap.git /tmp/lendsnap
RUN ln -s /tmp/lendsnap/code /var/lendsnap
WORKDIR /var/lendsnap

EXPOSE 22 3000
ENTRYPOINT [“ansible-playbook”]
