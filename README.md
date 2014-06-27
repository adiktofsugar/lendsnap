dockerfile-tiny-nodejs-wiki
===========================

smallest federated wiki is another revolution in the making


tiny instantiation of nodejs based small-federated-wiki using buildroot linux image


Small Federated Wiki is available at https://github.com/WardCunningham/Smallest-Federated-Wiki and more specifically the nodejs version at https://github.com/fedwiki/wiki-node


building the root image from scratch
------------------------------------
if you want to build the root image from scratch, follow the instructions in the buildimage.sh

specifically
after you download the buildroot source tree, and run "make menuconfig"
make sure to choose the following:
Target options -> Target Architecture -> x86_64
Target options -> Target Architecture Variant -> generic (already selected)
Toolchain -> Enable large file (files > 2 GB) support
Toolchain -> Enable IPv6 support
Toolchain -> Enable C++ support                                                                 

Target packages -> Interpreter languages and scripting -> nodejs
Target packages -> Interpreter languages and scripting -> Module Selection ---> (under nodejs)
Target packages -> Interpreter languages and scripting -> Module Selection -> NPM for the target                                        Target packages -> Interpreter languages and scripting -> Module Selection -> Express web application framework
Target packages -> Interpreter languages and scripting -> Module Selection -> CoffeeScript
Target packages -> Interpreter languages and scripting -> Module Selection -> Additional modules -- add "minimatch wiki"


