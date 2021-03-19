/* Magic Mirror
 * Module: HH-LocalTransport
 *
 * By Georg Peters https://github.com/georg90/
 * based on a Script from Benjamin Angst http://www.beny.ch
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const unirest = require('unirest');
const crypto = require('crypto');
const Log = require("../../js/logger");

module.exports = NodeHelper.create({

    start: function () {
        this.started = false;
        this.updateTimer = null;
    },


    /* createSimpleToken(payload)
     * Create authentication for custom API
     */
    createSimpleToken: function(payload) {
        const hmac = crypto.createHmac('sha1', this.config.customAPIToken);
        hmac.update(JSON.stringify(payload));
        var token = hmac.digest('base64');
        //Log.info(this.name + " : token: ", token);
        return token;
    },


    /* getSignature(payload)
     * Create authentication for HVV (Geofox) API
     * You'll need to request the access at their website. It's still in BETA!
     */
    getSignature: function(payload) {
        return new Promise((resolve) => {
            // Enable signature generating via external API, so you can share logins
            if (this.config.customAPI) {
                var token = this.createSimpleToken(payload);
                unirest.post(this.config.customUrl)
                    .headers({
                        'Content-Type': 'application/json;charset=UTF-8',
                        'auth-user': this.config.apiUser,
                        'token': token
                    })
                    .send(payload)
                    .end(function (response) {
                        if (response.error) { Log.error("Error: " + response.error); }
                        else { resolve(response.body); }
                    });
            }
            // Otherwise use standard solution with APIkey & user present
            else {
                const hmac = crypto.createHmac('sha1', this.config.apiKey);
                hmac.update(JSON.stringify(payload));
                var sig = hmac.digest('base64');
                //Log.info(this.name + " : sig: " + sig);
                resolve(sig);
            }
        });
    },


    /* updateTimetable(transports)
     * Calls processTrains on succesfull response.
     */
    updateTimetable: function() {
        var url = this.config.apiBase + 'departureList' // List all departures for given station
        var self = this;
        var data = {
            "station": {
                "type": "STATION",
                "id": this.config.id,
            },
            "time": { },
            "maxList": this.config.maximumEntries,
            "useRealtime": this.config.useRealtime,
            "maxTimeOffset": this.config.maxTimeOffset,
            "version": this.config.version,
        };
        self.getSignature(data).then((sig) => {
            unirest.post(url)
                .headers({
                    'Content-Type': 'application/json;charset=UTF-8',
                    'geofox-auth-user': this.config.apiUser,
                    'geofox-auth-signature': sig
                })
                .send(JSON.stringify(data))
                .end(function (r) {
                    if (r.error) {
                        Log.error(self.name + " : " + r.error);
                        Log.info(self.name + " : body: ", JSON.stringify(r.body));
                        self.sendSocketNotification("ERROR");
                        self.scheduleUpdate(300000); // 5mins
                    } else {
                        //Log.info("body: ", JSON.stringify(r.body));
                        self.processTrains(r.body);
                        self.scheduleUpdate((self.loaded) ? -1 : this.config.retryDelay);
                    }
                });
        });
    },


    /* processTrains(data)
     * Uses the received data to set the various values.
     * Keep the correct date (datetime) for later use.
     */
    processTrains: function(data) {
        this.trains = [];
        var time = data.time.time.split(':')
        hours = time[0];
        mins = time[1];
        var datetime = new Date(this.parseDate(data.time.date));
        datetime.setHours(hours);
        datetime.setMinutes(mins);
        if (typeof data.departures !== "undefined") {
            for (var i = 0, count = data.departures.length; i < count; i++) {
                var trains = data.departures[i];
                if (trains.timeOffset < 0) {
                    continue;
                }
                var departureTime = datetime.setMinutes(datetime.getMinutes() + trains.timeOffset);
                if (trains.delay != 0 && trains.delay != undefined) {
                    delay = trains.delay;
                } else {
                    delay = null;
                }
                this.trains.push({
                    departureTimestamp: trains.timeOffset,
                    delay: delay,
                    name: trains.line.name,
                    id: trains.line.id,
                    to: trains.line.direction
                });
            }
        }
        this.loaded = true;
        this.sendSocketNotification("TRAINS", this.trains);
    },


    /* scheduleUpdate()
     * Schedule next update.
     * argument delay number - Millis econds before next update. If empty, this.config.updateInterval is used.
     */
    scheduleUpdate: function(delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }
        var self = this;
        clearTimeout(this.updateTimer);
        if (this.started === true) {
            this.updateTimer = setTimeout(function() {
                self.updateTimetable();
            }, nextLoad);
        }
    },


    parseDate: function(input) {
        var parts = input.match(/(\d+)/g);
        return new Date(parts[2], parts[1]-1, parts[0]);
    },


    socketNotificationReceived: function(notification, payload) {

        if (notification === 'CONFIG' && this.started === false) {
            this.config = payload;
            this.started = true;
            this.scheduleUpdate(this.config.initialLoadDelay);
        }

        if (notification === 'SUSPENDING') {
            this.started = false;
            clearTimeout(this.updateTimer);
        }

        if (notification === 'RESUMING') {
            this.started = true;
            this.scheduleUpdate(this.config.initialLoadDelay);
        }

    }

});
