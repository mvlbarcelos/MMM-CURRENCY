/*
 *
 * MagicMirror Module: MMM-CURRENCY
 *
 * Author: Marcus Barcelos
 * License: MIT
 *
 * Global Module:
 */
Module.register("MMM-CURRENCY", {
    // default module configuration
    defaults: {
        updateInterval: 720, // minutes
        base: "EUR",
		symbols: "BRL,USD",
        accessKey: "802da68486cafce9ba9d36ff01c98e9b"
    },
    // Required version of MagicMirror
    requiresVersion: "2.1.0",
    // Module properties
    currencies: {},
    // Define translations
    getTranslations() {
        return {
            en: "translations/en.json",
            es: "translations/es.json",
            fr: "translations/fr.json",
        };
    },
    // Define stylesheets
    getStyles: function () {
        return ["MMM-CURRENCY.css"];
    },
    // Define scripts
    getScripts: function () {
        return [];
    },
    // Define Nunjucks template
    getTemplate() {
        return "templates/MMM-CURRENCY.njk";
    },
    // Define data that is sent to template
    getTemplateData() {
        return {
            config: this.config,
            currencies: this.currencies
        };
    },
    // Runs on initialization
    start: function () {
        // Get initial API data
        this.getData();

        // Schedule update poll
        var self = this;
        setInterval(function () {
            self.getData();
        }, self.config.updateInterval * 60 * 1000); // ms
    },
    // Fetch data request is sent to node helper with provided parameters
    getData: function () {
        this.sendSocketNotification("MMM-CURRENCY-REQUEST-DATA", {
            base: this.config.base,
            symbols: this.config.symbols,
            accessKey: this.config.accessKey,
        });
    },
    // Fetched data response is coming back from node helper
    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
            case "MMM-CURRENCY-RECEIVE-DATA": {
                this.renderUI(payload);
            } break;
            default: { };
        }
    },
    // Render response data
    renderUI: function (data) {
        if (!data) {
            console.error(this.translate('Error'))
            return;
        }
        this.currencies = data;
        // Update dom once currencies are set
        this.updateDom(500);
    }
});
