#
# Cookbook Name:: railsapp
# Recipe:: default
#
# Copyright (c) 2014 The Authors, All Rights Reserved.

bash "install epel repos" do
    user "root"
    cwd "/tmp"
    code <<-EOH
wget http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
wget http://rpms.famillecollet.com/enterprise/remi-release-6.rpm
rpm -Uvh remi-release-6*.rpm epel-release-6*.rpm 
    rm epel-release-6-8.noarch.rpm
    rm remi-release-6.rpm
    EOH
end

package "libyaml"
package "libyaml-devel"

cookbook_file "/tmp/ruby.rpm" do
    source "ruby-2.1.1-1.el6.x86_64.rpm"
end

bash "install ruby rpm" do
    user "root"
    code "rpm -i /tmp/ruby.rpm"
end
gem_package "bundler" do
    gem_binary "gem"
end
gem_package "rails" do
    gem_binary "gem"
end
