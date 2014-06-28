################################################################################
#
# leveldb
#
################################################################################

LEVELDB_VERSION = 1.15.0
LEVELDB_SOURCE = leveldb-$(LEVELDB_VERSION).tar.gz
LEVELDB_SITE = https://leveldb.googlecode.com/files/$(LEVELDB_SOURCE)

define LEVELDB_BUILD_CMDS
    $(MAKE) -C $(@D) all
endef


define LEVELDB_INSTALL_TARGET_CMDS
    $(INSTALL) -D -m 0644 $(@D)/libleveldb.a $(TARGET_DIR)/usr/lib
    $(INSTALL) -D -m 0755 $(@D)/libleveldb.so.1.17 $(TARGET_DIR)/usr/lib

    $(LN) -sfr $(TARGET_DIR)/usr/lib/libleveldb.so.1.17 $(TARGET_DIR)/usr/lib/libleveldb.so.1

    $(LN) -sfr $(TARGET_DIR)/usr/lib/libleveldb.so.1.17 $(TARGET_DIR)/usr/lib/libleveldb.so

    $(INSTALL) -D -m 0755 $(@D)/include/leveldb $(TARGET_DIR)/usr/include

    $(INSTALL) -d -m 0755 $(TARGET_DIR)/etc/foo.d
endef

$(eval $(generic-package))
