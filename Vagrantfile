# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

STATIC_IP = "192.168.33.10"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  
  config.vm.box = "ubuntu-12.04-docker"
  config.vm.network "private_network", ip: STATIC_IP
  congig.vm.hostname "lendsnap"
  config.vm.post_up_message = <<-eos
  This is the lendsnap VM.
  GOOD LUCK SUCKER!
  eos

  config.vm.synced_folder "code/", "/synced/code",
    create: true
  config.vm.provider "docker" do |docker|
    docker.build_dir = "code/webapp"
  end
  config.vm.provision "docker" do |docker|
  end


  # config.vm.provider "virtualbox" do |vb|
  #   vm_name = "lendsnap"
  #   vb.name = vm_name
  #   vb.customize ["setextradata", vm_name, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/code", "1"]
  # end
  # config.vm.provision "ansible" do |ansible|
  #   ansible.playbook = "ansible/playbook.yml"
  #   ansible.verbose = "vv"
  #   ansible.extra_vars = {
  #     developer_name: ENV["USER"]
  #   }
  # end
end
