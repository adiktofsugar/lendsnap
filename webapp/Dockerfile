FROM    centos:centos6
RUN     yum -y update
RUN     yum -y groupinstall "development tools"
RUN     yum -y install wget

# Install ruby-install
RUN cd /tmp &&\
  wget -O ruby-install-0.4.3.tar.gz https://github.com/postmodern/ruby-install/archive/v0.4.3.tar.gz &&\
  tar -xzvf ruby-install-0.4.3.tar.gz &&\
  cd ruby-install-0.4.3/ &&\
  make install

RUN     ruby-install ruby 2.1.2
RUN     gem install bundler

# Install Ruby application dependencies
RUN yum install -y git libyaml libyaml-devel

COPY    . /src
RUN     cd /src; bundle install
EXPOSE  3000
CMD     ["cd /src/", "&&", "rails", "s", "--port", "3000"]
