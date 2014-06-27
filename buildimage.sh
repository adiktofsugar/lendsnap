#!/bin/bash
##  this assumes you've checked out this git repository via github using
# git clone https://github.com/lexlapax/dockerfile-tiny-nodejs-wiki
# cd dockerfile-tiny-nodejs-wiki
## and you're running this script ./buildimage.sh from that directory
## after you've done chmod +x buildimage.sh

export IMAGENAME=tiny-nodejs-wiki
export BUILDROOTVER=2014.05


CURDIR=`pwd`

mkdir src-buildroot
cd src-buildroot

echo " wget -c http://buildroot.uclibc.org/downloads/buildroot-$BUILDROOTVER.tar.gz"
wget -c http://buildroot.uclibc.org/downloads/buildroot-$BUILDROOTVER.tar.gz
echo " exploding tar file"
sh -c "tar -xzvf buildroot-$BUILDROOTVER.tar.gz" >>$CURDIR/build.log 2>&1
echo "copying buildroot config" 
cp -r $CURDIR/buildroot.config buildroot-$BUILDROOTVER/.config
echo " building root filesystem" 
cd buildroot-$BUILDROOTVER
sh -c "make all" >> $CURDIR/build.log 2>&1
echo wait a really long time while it builds everything including the toolchain
# 


# quoted from the docker buildroot blog post
#
# You should see a small, lean, rootfs.tar file, containing the image to be imported 
# in Docker. But it’s not quite ready yet. We need to fix a few things. 
# 
# Docker sets the DNS configuration by bind-mounting over /etc/resolv.conf. 
# This means that /etc/resolv.conf has to be a standard file. By default, 
# buildroot makes it a symlink. We have to replace that 
# symlink with a file (an empty file will do). 
# 
# Likewise, Docker “injects” itself within containers by bind-mounting over /sbin/init. 
# This means that /sbin/init should be a regular file as well. By default, 
# buildroot makes it a symlink to busybox. We will change that, too.

echo "fix up the rootfs filesytem"
mkdir -p output/images/fixup/sbin output/images/fixup/etc 
touch output/images/fixup/sbin/init output/images/fixup/etc/resolv.conf
# add nodejs and wiki specific stuff here

cd output/images
cp rootfs.tar fixup.tar
tar rvf fixup.tar -C fixup .

cp fixup.tar $CURDIR/$IMAGENAME.tar


echo "build the docker image"
cd $CURDIR
# docker steps
sh -c "docker build -t $IMAGENAME ." >> $CURDIR/build.log 2>&1

