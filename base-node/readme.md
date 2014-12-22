From: https://github.com/lexlapax/dockerfile-tiny-nodejs-wiki
Inspired from: http://blog.docker.com/2013/06/create-light-weight-docker-containers-buildroot/

`cd base-node-build`
`./buildimage fetch
`make menuconfig`

	> Target options -> Target Architecture -> x86_64
	> Target options -> Target Architecture Variant -> generic (already selected)
	> Toolchain -> Enable large file (files > 2 GB) support
	> Toolchain -> Enable IPv6 support
	> Toolchain -> Enable WCHAR support                                                              
	> Toolchain -> Enable C++ support                                                                 
	> Target packages -> Interpreter languages and scripting -> python
	> Target packages -> Interpreter languages and scripting -> external python modules -> python-versiontools
	> Target packages -> Interpreter languages and scripting -> external python modules -> python-setuptools

	#### install sshd
	> Target packages -> Networking applications -> openssh

	#### install supervisord
	> Target packages -> System tools -> supervisor

	### nodejs specific config
	> Target packages -> Interpreter languages and scripting -> nodejs

	> Target packages -> Interpreter languages and scripting -> Module Selection ---> (under nodejs)

	> Target packages -> Interpreter languages and scripting -> Module Selection -> NPM for the target                                    

	> Target packages -> Interpreter languages and scripting -> Module Selection -> Express web application framework

	> Target packages -> Interpreter languages and scripting -> Module Selection -> CoffeeScript

	> Target packages -> Interpreter languages and scripting -> Module Selection -> Additional modules -- add "mime minimatch"
`./buildimage fixup`
`docker import - base-node < fixup.tar`
