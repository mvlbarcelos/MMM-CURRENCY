Module.register("MMM-Currency",{
	defaults: {
		title: "Currency",
		apiBase: "http://api.exchangeratesapi.io/latest",
		base: "EUR",
		symbols: [ "BRL", "USD"],
		access_key: null,
	},

	getStyles: function() {
		return ['MMM-Currency.css'];
	},
	getTemplate: function() {
		return "MMM-Currency.njk";
	},

	start: function() {
		Log.info('Starting module: ' + this.name);
		var self = this;
		this.updateCurrencies();
		setInterval(function() {
			self.updateCurrencies();
			self.updateDom(); // no speed defined, so it updates instantly.
		}, 1000 * 60 * 60 * 12);
    },

	getTemplateData: function() {
		return {
			title: this.config.title,
			currencies: this.currencies,
		};
	},

	getParams: function() {
		var params = '?';
		params += "base=" + this.config.base;
		params += "&symbols=" + this.config.symbols.join();
		params += "&access_key=" + this.config.access_key;
		return params;
	},

	processCurrencies: function(data) {
		this.currencies = {}
		this.currencies.updated_at = moment.unix(data.timestamp).format('DD.MM.YYYY HH:mm:ss');
		this.currencies.rates = [];
		this.currencies.rates.push({
			currency: this.config.base,
			symbol: 'eu',
			rate: 1,
		});
		for (key in data.rates) {
			this.currencies.rates.push({
				currency: key,
				symbol: key.toLowerCase().slice(0,-1),
				rate: +(Math.round(data.rates[key] + "e+2")  + "e-2"),
			});
		}
    },

	updateCurrencies: function() {

		var url = this.config.apiBase + this.getParams();
		var Request = new XMLHttpRequest();
		// this.processCurrencies({"success":true,"timestamp":1630147084,"base":"EUR","date":"2021-08-28","rates":{"BRL":6.139554,"USD":1.17954}})
		Request.timeout = 15000; 
		Request.open("GET", url, false);
		Log.info('url: ' + url);
		var self = this;
		Request.onreadystatechange = function() {
			Log.info('readyState: ' + this.readyState );
			if (this.readyState === 4) {
				Log.info('status: ' + this.status);
				if (this.status === 200) {
					Log.info('response: ' + this.response);
					self.processCurrencies(JSON.parse(this.response));
				} else {
					Log.error(self.name + ": Could not load data.");
				}
			}
		};
		Request.send();
	},
});
