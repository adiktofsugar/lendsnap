FROM scratch
MAINTAINER Sean <anincrediblyshortname@gmail.com>
ADD base-node.tar /
ADD root_id_rsa.pub /root/.ssh/authorized_keys
RUN chown root:root /root/.ssh/authorized_keys
RUN npm install -g npm
ADD custom-modules /var/lendsnap/base-node/custom-modules
RUN ssh-keygen -t rsa -f /etc/ssh_host_rsa_key
