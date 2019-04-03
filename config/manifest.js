/**
 * Created by Shivam Raj.
 * Project: gamingmonk
 */
const config = require('config');
const Config = JSON.parse(JSON.stringify(config));
const Nunjucks = require('nunjucks');
const Controller = require('../app/controllers/user');

const Pack = require('../package');

const Inert = require('inert');
const Vision = require('vision');

const plugins = [
	{
		plugin: './lib/mongoose',
		options: {
			uri: Config.mongo
		}
	},
	{
		plugin: './lib/auth'
	},
	{
		plugin: require('hapi-swagger'),
		options: {
			info: {
				title: 'Test API Documentation',
				version: Pack.version
			},
			securityDefinitions: {
				jwt: {
					type: 'apiKey',
					name: 'Authorization',
					in: 'header'
				}
			},
			security: [ { jwt: [] } ]
		}
	},
	{
		plugin: './app/routes/user',
		routes: {
			prefix: '/user'
		}
	}
];
exports.manifest = {
	server: {
		router: {
			stripTrailingSlash: true,
			isCaseSensitive: false
		},
		routes: {
			security: {
				hsts: false,
				xss: true,
				noOpen: true,
				noSniff: true,
				xframe: false
			},
			cors: true,
			jsonp: 'callback' // <3 Hapi,
		},
		debug: Config.debug,
		port: Config.port,
		cache: [ { ...Config.redisCache, engine: require('catbox-redis') } ]
	},
	register: {
		plugins
	}
};

exports.options = {
	// somehow vision only works if you register your vision plugin at this point
	// otherwise it gives you an error => Cannot render view without a views manager configured
	// Not a perfect solution but it works OK
	preRegister: async (server) => {
		await server.register([ Inert, Vision ]);
		server.route({
			method: 'GET',
			path: '/',
			options: Controller.home
		});
		server.views({
			engines: {
				html: {
					compile: (src, options) => {
						const template = Nunjucks.compile(src, options.environment);
						return (context) => {
							return template.render(context);
						};
					},
					prepare: (options, next) => {
						options.compileOptions.environment = Nunjucks.configure(options.path, { watch: false });
						return next();
					}
				}
			},
			path: './templates' // look at server.js, for more information: [relativeTo: __dirname]
		});
	}
};
