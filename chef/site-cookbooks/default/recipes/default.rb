#
# Cookbook Name:: default
# Recipe:: default
#
# Copyright (c) 2014 The Authors, All Rights Reserved.

yum_package "git"
yum_package "man"
yum_package "epel-release"

cookbook_file "sysconfig_network" do
    path "/etc/sysconfig/network"
end
cookbook_file "etc_hosts" do
    path "/etc/hosts"
end
