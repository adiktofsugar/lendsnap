#
# Cookbook Name:: railsapp
# Recipe:: default
#
# Copyright (c) 2014 The Authors, All Rights Reserved.

include_recipe "rvm::system_install"
include_recipe "rvm::vagrant"

rvm_default_ruby "1.9.3"
rvm_gem "bundler"
