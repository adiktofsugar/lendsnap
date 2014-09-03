#
# Cookbook Name:: webserver
# Recipe:: default
#
# Copyright (c) 2014 The Authors, All Rights Reserved.

file "/etc/yum.repos.d/nginx.repo" do
    content "
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/6/x86_64/
gpgcheck=0
enabled=1
    "
end

yum_package "nginx"
