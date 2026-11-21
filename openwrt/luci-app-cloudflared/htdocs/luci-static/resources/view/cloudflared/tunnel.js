'use strict';
'require rpc';
'require view';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

function getServiceStatus() {
	return callServiceList('cloudflared').then(function(response) {
		var instance = response.cloudflared &&
			response.cloudflared.instances &&
			response.cloudflared.instances.cloudflared;
		return {
			running: !!(instance && instance.running),
			error: null
		};
	}).catch(function(error) {
		return { running: false, error: String(error) };
	});
}

return view.extend({
	load: function() {
		return getServiceStatus();
	},

	render: function(status) {
		var state = status.error ?
			_('Could not read service status: %s').format(status.error) :
			(status.running ? _('Service process is running') : _('Tunnel process is stopped'));

		return E([], [
			E('h2', { 'class': 'section-title' }, _('Tunnel and domain')),
			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('Connector status')),
				E('p', {}, state),
				E('p', {}, _('This page checks the local service only. It does not call “cloudflared tunnel list”, which requires account credentials and is unavailable for token-managed tunnels.'))
			]),
			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('Publish a domain')),
				E('ol', {}, [
					E('li', {}, _('Open Cloudflare Zero Trust → Networks → Tunnels and select this tunnel.')),
					E('li', {}, _('Under Public Hostnames, add the hostname you want, for example app.example.com.')),
					E('li', {}, _('Set the service to the private origin address and port reachable from this router, for example http://192.168.1.20:8080.')),
					E('li', {}, _('Save the route in Cloudflare, then enable the tunnel and paste its token on the Configuration page.'))
				]),
				E('p', { 'class': 'alert-message' }, _('Do not use the public Cloudflare hostname as the origin service: that can create a routing loop. Use the private LAN IP/port of the application instead.')),
				E('p', {}, [
					_('Manage hostname routes in the '),
					E('a', {
						'href': 'https://one.dash.cloudflare.com/',
						'target': '_blank',
						'rel': 'noopener noreferrer'
					}, _('Cloudflare Zero Trust dashboard')),
					_('.')
				])
			]),
			E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, _('Troubleshooting')),
				E('p', {}, _('For token-managed tunnels, an origin certificate and /etc/cloudflared/config.yml are not required. This app does not create an empty config file or query the account-only tunnel list.')),
				E('p', {}, _('If the tunnel is stopped, check the router System Log for cloudflared messages. Confirm the token is current and the origin address is reachable from the router.'))
			])
		]);
	}
});
