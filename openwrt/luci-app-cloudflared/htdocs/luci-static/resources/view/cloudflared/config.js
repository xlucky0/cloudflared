'use strict';
'require form';
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
		return instance && instance.running ? _('Running') : _('Stopped');
	}).catch(function(error) {
		return _('Status unavailable: %s').format(error);
	});
}

return view.extend({
	load: function() {
		return Promise.all([ getServiceStatus() ]);
	},

	render: function(data) {
		var map = new form.Map('cloudflared', _('Cloudflare Tunnel'),
			_('Use a remotely-managed tunnel token. This mode does not need an account certificate or a local config.yml file.'));
		var section = map.section(form.NamedSection, 'config', 'cloudflared');
		var option;

		option = section.option(form.DummyValue, '_status', _('Service status'));
		option.cfgvalue = function() {
			return data[0];
		};

		option = section.option(form.Flag, 'enabled', _('Enable tunnel'));
		option.rmempty = false;
		option.default = '0';

		option = section.option(form.Value, 'token', _('Tunnel token'),
			_('Copy the token from Cloudflare Zero Trust → Networks → Tunnels → your tunnel → Configure.'));
		option.password = true;
		option.rmempty = true;
		option.placeholder = _('Paste the tunnel token');

		option = section.option(form.ListValue, 'protocol', _('Connection protocol'),
			_('Auto is recommended. Use HTTP/2 if outbound UDP is blocked.'));
		option.value('auto', _('Automatic (recommended)'));
		option.value('quic', _('QUIC'));
		option.value('http2', _('HTTP/2'));
		option.default = 'auto';
		option.rmempty = false;

		option = section.option(form.ListValue, 'loglevel', _('Log level'));
		option.value('info', _('Info'));
		option.value('warn', _('Warning'));
		option.value('error', _('Error'));
		option.value('debug', _('Debug'));
		option.default = 'info';
		option.rmempty = false;

		return map.render();
	}
});
