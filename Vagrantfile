# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

STATIC_IP = "192.168.33.10"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  
  config.vm.box = "centos_65_x86_64"
  config.vm.box = "https://f0fff3908f081cb6461b407be80daf97f07ac418.googledrive.com/host/0BwtuV7VyVTSkUG1PM3pCeDJ4dVE/centos7.box"

  config.vm.network "private_network", ip: STATIC_IP

  config.ssh.forward_agent = true

  config.vm.provider "virtualbox" do |vb|
    vm_name = "lendsnap"
    vb.name = vm_name
    vb.customize ["setextradata", vm_name, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/code", "1"]
  end
  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "ansible/playbook.yml"
    ansible.verbose = "vv"
    ansible.extra_vars = {
      developer_name: ENV["USER"]
    }
  end
end
