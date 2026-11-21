# Cloudflared for OpenWrt and LuCI

This feed contains an OpenWrt `cloudflared` package and a LuCI app for
remotely-managed Cloudflare Tunnels. Configure the token in LuCI; SSH and
an account `cert.pem` are not needed.

## Build target-specific packages

Use an OpenWrt 25.12 build tree; this Cloudflared release requires Go 1.27.
From a clean build tree, first update the feeds and copy these packages into
their matching feed locations. The feeds may already contain packages with
these names, so replace both directories to avoid stale patches or views:

```sh
./scripts/feeds update packages luci
git -C feeds/packages fetch origin openwrt-25.12
git -C feeds/packages checkout --detach FETCH_HEAD
rm -rf feeds/packages/net/cloudflared \
  feeds/luci/applications/luci-app-cloudflared
mkdir -p feeds/packages/net/cloudflared \
  feeds/luci/applications/luci-app-cloudflared
cp -a /path/to/cloudflared/openwrt/packages/net/cloudflared/. \
  feeds/packages/net/cloudflared/
cp -a /path/to/cloudflared/openwrt/luci-app-cloudflared/. \
  feeds/luci/applications/luci-app-cloudflared/
./scripts/feeds install -p packages cloudflared
./scripts/feeds install -p luci luci-app-cloudflared
make menuconfig
make package/cloudflared/compile
make package/luci-app-cloudflared/compile
```

Select `cloudflared` and `luci-app-cloudflared` in `make menuconfig` before
building.

The resulting package format and architecture are selected by the OpenWrt
build tree. OpenWrt releases that use APK produce `.apk` files; older releases
may produce `.ipk` files. A target-specific SDK/build tree is required to
produce installable packages. Install both packages using the package manager
on the router.

## Configure in LuCI

1. Open **VPN → Cloudflare Tunnel → Configuration**.
2. Paste the tunnel token from **Cloudflare Zero Trust → Networks → Tunnels**.
3. Keep the protocol at **Automatic** unless outbound UDP is blocked; then use
   **HTTP/2**.
4. Enable the tunnel and save/apply.
5. In the Cloudflare dashboard, add a **Public Hostname** route for each
   domain. Set its service to the application's private LAN address and port,
   such as `http://192.168.1.20:8080`.

The package enables its procd service at install time. Leaving the LuCI
**Enable tunnel** switch off keeps the daemon stopped; enabling it and applying
the form starts it and keeps it enabled after reboot.

The hostname-to-origin mapping belongs to the remotely-managed tunnel in the
Cloudflare dashboard. Do not set the public hostname itself as the origin
service, or requests may loop back to Cloudflare.

The **Tunnel and domain** page checks only the local procd service. It
intentionally does not run `cloudflared tunnel list`: that account-management
command requires account credentials and fails for token-only connectors.
Logs are available under the router's **System Log**.

The UCI service starts only when enabled and a token is present. It does not
pass `--config` or `--origincert`, and rejects unsupported protocol/log-level
values with a message in the system log.
