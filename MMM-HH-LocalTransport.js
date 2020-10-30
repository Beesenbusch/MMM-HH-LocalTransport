/* Timetable for local transport Module */

/* Magic Mirror
 * Module: HH-LocalTransport
 *
 * By Georg Peters https://github.com/georg90/
 * based on a script from Benjamin Angst http://www.beny.ch
 * MIT Licensed.
 */

Module.register("MMM-HH-LocalTransport",{

    // Define module defaults
    defaults: {
        maximumEntries: 10, // Total Maximum Entries
        maxTimeOffset: 200, // Max time in the future for entries
        useRealtime: true,
        updateInterval: 1 * 60 * 1000, // Update every minute.
        animationSpeed: 2000,
        fade: true,
        fadePoint: 0.25, // Start on 1/4th of the list.
        initialLoadDelay: 1, // start delay seconds.
        apiBase: 'https://gti.geofox.de/gti/public/',
        customAPI: false, // Set to true if signature is generated via external API
        customUrl: 'https://custom-api.url.de/apiEndpoint', // change to API endpoint (receiving payload and returns siganture)
        customAPIToken: 'token123', // custom token to authenticate
        apiKey: '',
        apiUser: '',
        version: 38, // HVV API version
        id: "Master:9910910", // HH HBF
        iconSize: 18, // Icon size for HVV lines
    },

    // Define required scripts.
    getStyles: function() {
        return ["MMM-HH-LocalTransport.css", "font-awesome.css"];
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification('CONFIG', this.config);
        this.trains = [];
        this.loaded = false;
        this.error = false;
    },

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");

        if (this.config.id === "") {
            wrapper.innerHTML = "Please set the correct Station ID: " + this.name + ".";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if (this.config.apiKey === "") {
            wrapper.innerHTML = "Please set API key: " + this.name + ".";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if (this.error) {
            wrapper.innerHTML = "Fehler beim Verbindungsaufbau";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if (!this.loaded) {
            wrapper.innerHTML = "Loading connections ...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }


        // The "table" as a div
        var divTable = document.createElement("div");
        divTable.className = "hvvtable small";

        // The "table body" as a div
        var divTableBody = document.createElement("div");
        divTableBody.className = "hvvtablebody";
        divTable.appendChild(divTableBody);

        for (var t in this.trains) {
            var trains = this.trains[t];
            var divRow = document.createElement("div");
            divRow.className = "hvvrow";
            divTableBody.appendChild(divRow);

            // departure time cell
            var divCellDep = document.createElement("div");
            divCellDep.className = "hvvdeparture";
            if (trains.departureTimestamp == 0) {
                divCellDep.innerHTML = "now";
            } else {
                divCellDep.innerHTML = trains.departureTimestamp + " min";
            }
            divRow.appendChild(divCellDep);

            // possible delays cell
            var divCellDelay = document.createElement("div");
            divCellDelay.className = "hvvdelay";
            if(trains.delay) {
                divCellDelay.innerHTML = "+" + (trains.delay / 60);
            }
            divRow.appendChild(divCellDelay);

            // line name cell
            var divCellLine = document.createElement("div");
            var lineIcon = document.createElement("IMG");
            lineIcon.src = "https://www.geofox.de/icon_service/line?height=" + this.config.iconSize + "&lineKey=" + trains.id;
            lineIcon.alt = trains.name;
            divCellLine.appendChild(lineIcon);
            divCellLine.className = "hvvline";
            divRow.appendChild(divCellLine);

            // line destination cell
            var divCellDest = document.createElement("div");
            divCellDest.innerHTML = trains.to;
            divCellDest.className = "hvvdestination";
            divRow.appendChild(divCellDest);

            // handle fading
            if (this.config.fade && this.config.fadePoint < 1) {
                if (this.config.fadePoint < 0) {
                    this.config.fadePoint = 0;
                }
                var startingPoint = this.trains.length * this.config.fadePoint;
                var steps = this.trains.length - startingPoint;
                if (t >= startingPoint) {
                    var currentStep = t - startingPoint;
                    divRow.style.opacity = 1 - (1 / steps * currentStep);
                }
            }
        }
        return divTable;
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "TRAINS"){
            Log.info("Trains arrived");
            this.trains = payload;
            this.loaded = true;
            this.error = false;
            this.updateDom(this.config.animationSpeed);
        }
        if (notification === "ERROR"){
            Log.info("There was an error");
            this.error = true;
            this.updateDom(this.config.animationSpeed);
        }
    },

    suspend: function() {
        console.log(this.name + " is suspended.")
        this.sendSocketNotification('SUSPENDING');
    },

    resume: function() {
        console.log(this.name + " is resumed.")
        this.sendSocketNotification('RESUMING');
    }

});
