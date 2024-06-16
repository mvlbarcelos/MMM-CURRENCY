/*
 *
 * MagicMirror Module: MMM-CURRENCY
 *
 * Author: Marcus Barcelos
 * License: MIT
 *
 * Node Helper:
 */

var NodeHelper = require("node_helper");
const http = require('http');
const Log = require("logger");
const moment = require("moment");

module.exports = NodeHelper.create({
    // Override socketNotificationReceived method.
    socketNotificationReceived: function (notification, payload) {
        let self = this;
        switch (notification) {
            case "MMM-CURRENCY-REQUEST-DATA": {
                const options = {
                    hostname: 'api.exchangeratesapi.io',
                    port: 80,
                    path: `/latest?base=${payload.base}&symbols=${payload.symbols}&access_key=${payload.accessKey}`,
                    method: 'GET',
                    rejectUnauthorized: false
                };
                const request = http.request(options, (res) => {
                    const body = [];
                    res.on('data', (chunk) => {
                        body.push(chunk);
                    });
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(Buffer.concat(body).toString());
                            Log.info(json);
                            let data = {};
                            data.updated_at = moment.unix(json.timestamp).format('DD.MM.YYYY HH:mm:ss');
                            data.rates = [];
                            data.rates.push({
                                currency: payload.base,
                                symbol: 'eu',
                                rate: 1,
                            });
                            for (key in json.rates) {
                                data.rates.push({
                                    currency: key,
                                    symbol: key.toLowerCase().slice(0,-1),
                                    rate: +(Math.round(json.rates[key] + "e+2")  + "e-2"),
                                });
                            }
                            Log.info(data);
                            self.sendSocketNotification("MMM-CURRENCY-RECEIVE-DATA", data);
                        } catch (e) {
                            // Error - send null back to global module
                            self.sendSocketNotification("MMM-CURRENCY-RECEIVE-DATA", null);
                        }
                    });
                });
                request.on('error', (error) => {
                    // Error - send null back to global module
                    self.sendSocketNotification("MMM-CURRENCY-RECEIVE-DATA", null);
                });


                request.end();
            }; break;
            default: { };
        }
    }
});