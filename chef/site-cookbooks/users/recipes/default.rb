#
# Cookbook Name:: users
# Recipe:: default
#
# Copyright (c) 2014 The Authors, All Rights Reserved.

user "smccollum"
directory "/home/smccollum/.ssh" do
    owner "smccollum"
    group "smccollum"
    mode 00700
end
cookbook_file "smccollum_authorized_keys" do
    path "/home/smccollum/.ssh/authorized_keys"
    mode 00600
    owner "smccollum"
    group "smccollum"
end
cookbook_file "smccollum_sudoersd" do
    path "/etc/sudoers.d/smccollum"
end
