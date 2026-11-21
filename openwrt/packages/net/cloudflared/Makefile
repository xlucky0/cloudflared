# SPDX-License-Identifier: Apache-2.0

include $(TOPDIR)/rules.mk

PKG_NAME:=cloudflared
PKG_VERSION:=2026.11.1
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/cloudflare/cloudflared/tar.gz/refs/tags/$(PKG_VERSION)?
PKG_HASH:=d72ba7465d392a7c82be85e9417c0c923aa69e7c6dbc9baaeb42bb49a8f0572d

PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE
PKG_BUILD_DEPENDS:=golang1.27/host
PKG_BUILD_PARALLEL:=1
PKG_BUILD_FLAGS:=no-mips16

GO_PKG:=github.com/cloudflare/cloudflared
GO_PKG_LDFLAGS_X:=main.Version=$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk
include ../../lang/golang/golang-package.mk

define Package/cloudflared
  SECTION:=net
  CATEGORY:=Network
  SUBMENU:=Web Servers/Proxies
  TITLE:=Cloudflare Tunnel client
  URL:=https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/
  DEPENDS:=$(GO_ARCH_DEPENDS) +ca-bundle
endef

define Package/cloudflared/description
  Cloudflare Tunnel client with a procd service configured through UCI
  and LuCI. Remotely-managed tunnels use a token and do not need an
  origin certificate or an empty config.yml file.
endef

define Package/cloudflared/conffiles
/etc/config/cloudflared
endef

define Package/cloudflared/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || /etc/init.d/cloudflared enable
endef

define Package/cloudflared/install
	$(call GoPackage/Package/Install/Bin,$(1))
	$(INSTALL_DIR) $(1)/etc/config $(1)/etc/init.d
	$(INSTALL_CONF) $(CURDIR)/files/cloudflared.config $(1)/etc/config/cloudflared
	$(INSTALL_BIN) $(CURDIR)/files/cloudflared.init $(1)/etc/init.d/cloudflared
endef

$(eval $(call GoBinPackage,cloudflared))
$(eval $(call BuildPackage,cloudflared))
