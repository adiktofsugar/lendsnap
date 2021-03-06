# -*- mode: ruby -*-
# # vi: set ft=ruby :
require 'rbconfig'
is_windows = (RbConfig::CONFIG['host_os'] =~ /mswin|mingw|cygwin/)

require 'fileutils'

Vagrant.require_version ">= 1.6.0"

#
# coreos-vagrant is configured through a series of configuration
# options (global ruby variables) which are detailed below. To modify
# these options, first copy this file to "config.rb". Then simply
# uncomment the necessary lines, leaving the $, and replace everything
# after the equals sign..

# Size of the CoreOS cluster created by Vagrant
$user_datas=["webserver"]#, "db"]

# Official CoreOS channel from which updates should be downloaded
$update_channel='stable'

# Log the serial consoles of CoreOS VMs to log/
# Enable by setting value to true, disable with false
# WARNING: Serial logging is known to result in extremely high CPU usage with
# VirtualBox, so should only be used in debugging situations
$enable_serial_logging=false

# Enable port forwarding of Docker TCP socket
# Set to the TCP port you want exposed on the *host* machine, default is 2375
# If 2375 is used, Vagrant will auto-increment (e.g. in the case of $num_instances > 1)
# You can then use the docker tool locally by setting the following env var:
#   export DOCKER_HOST='tcp://127.0.0.1:2375'
$expose_docker_tcp=2375

# Setting for VirtualBox VMs
$vb_gui = false
$vb_memory = 1024
$vb_cpus = 1

unless Vagrant.has_plugin?("vagrant-triggers") then
  command="vagrant plugin install vagrant-triggers"
  puts "Running command #{command}"
  pid = spawn(command)
  Process.wait pid
  puts "..finished running command"
  puts "You have to reload the vagrant process now."
  exit
end


Vagrant.configure("2") do |config|
  config.vm.box = "coreos-%s" % $update_channel
  config.vm.box_version = ">= 494.4.0"
  config.vm.box_url = "http://%s.release.core-os.net/amd64-usr/current/coreos_production_vagrant.json" % $update_channel

  config.vm.provider :vmware_fusion do |vb, override|
    override.vm.box_url = "http://%s.release.core-os.net/amd64-usr/current/coreos_production_vagrant_vmware_fusion.json" % $update_channel
  end

  config.vm.provider :virtualbox do |v|
    # On VirtualBox, we don't have guest additions or a functional vboxsf
    # in CoreOS, so tell Vagrant that so it can be smarter.
    v.check_guest_additions = false
    v.functional_vboxsf     = false
  end

  # plugin conflict
  if Vagrant.has_plugin?("vagrant-vbguest") then
    config.vbguest.auto_update = false
  end

  $user_datas.each_with_index do |user_data_name, i|
    i = i + 1

    config.vm.define vm_name = "core-%02d" % i do |config|
      
      config.vm.hostname = vm_name

      if $enable_serial_logging
        logdir = File.join(File.dirname(__FILE__), "log")
        FileUtils.mkdir_p(logdir)

        serialFile = File.join(logdir, "%s-serial.txt" % vm_name)
        FileUtils.touch(serialFile)

        config.vm.provider :vmware_fusion do |v, override|
          v.vmx["serial0.present"] = "TRUE"
          v.vmx["serial0.fileType"] = "file"
          v.vmx["serial0.fileName"] = serialFile
          v.vmx["serial0.tryNoRxLoss"] = "FALSE"
        end

        config.vm.provider :virtualbox do |vb, override|
          vb.customize ["modifyvm", :id, "--uart1", "0x3F8", "4"]
          vb.customize ["modifyvm", :id, "--uartmode1", serialFile]
        end
      end

      if $expose_docker_tcp
        config.vm.network "forwarded_port", guest: 2375, host: ($expose_docker_tcp + i - 1), auto_correct: true
      end

      config.vm.provider :vmware_fusion do |vb|
        vb.gui = $vb_gui
      end

      config.vm.provider :virtualbox do |vb|
        vb.gui = $vb_gui
        vb.memory = $vb_memory
        vb.cpus = $vb_cpus
      end

      ip = "172.17.8.#{i+100}"
      config.vm.network :private_network, ip: ip

      if not is_windows
        config.vm.synced_folder ".", "/var/lendsnap-repo",
          id: "lendsnap", :nfs => true, :mount_options => ['nolock,vers=3,udp']
      end


      project_root = File.expand_path('.', File.dirname(__FILE__))
      user_data_template_path = File.join(project_root, "deploy/#{user_data_name}-user-data")
      user_data_path = File.join(project_root, ".user-data-#{user_data_name}")
      token_path = File.join(project_root, '.current-cluster-token')
      
      config.trigger.before :up, :stdout => true, :vm => vm_name do |trigger|
        info "Starting to generate etcd token..."
        unless File.exists? token_path
          file = open(token_path, 'w')
          require 'open-uri'
          token = open('https://discovery.etcd.io/new').read
          file.write(token)
          file.close
        end
        token = open(token_path).read
        data = YAML.load(IO.readlines(user_data_template_path)[1..-1].join)
        data['coreos']['etcd']['discovery'] = token

        yaml = YAML.dump(data)
        open(user_data_path, 'w') do |file|
            file.write("#cloud-config\n\n#{yaml}")
        end
      end
      config.trigger.after :up, :vm => vm_name do
        if is_windows
          info "Run the setup samba script"
        end
      end
      config.trigger.before :destroy, :stdout => true, :vm => vm_name do
        File.unlink user_data_path if File.exists? user_data_path
        File.unlink token_path if File.exists? token_path
        info("Deleted #{user_data_path}")
      end
      config.vm.provision :file, :source => "#{user_data_path}", :destination => "/tmp/vagrantfile-user-data"
      config.vm.provision :shell, :inline => "mv /tmp/vagrantfile-user-data /var/lib/coreos-vagrant/", :privileged => true

      # This is for windows if i can ever get it to work. For now use the setup-samba script
      # config.vm.synced_folder ".", "/var/lendsnap-repo",
      #   id: "lendsnap", type: "smb"
    end
  end
end
